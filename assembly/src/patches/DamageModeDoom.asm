.include "BuildPatch.asm"

; Define health reducing function
.orga 0xC5CF3C
    addiu   ra, ra, 0x0014
    lhu     t1, 0x003E (v1) ; load tatl timer
    andi    t2, t1, 0x007F
    lhu     t6, 0x3F22 (v1) ; load interface state
    addiu   t5, r0, 0x0032
    bne     t5, t6, .+0x1C  ; if interface state is not 0x32, game is not active, return
    lh      t3, 0x0036 (v1) ; load current health
    bnez    t2, .+0x14      ; reduce health every 0x7F frames
    lh      t1, 0x0034 (v1) ; load max health
    srl     t2, t1, 4       ; divide by 16
    subu    t0, t3, t2      ; subtract from current health
    sh      t0, 0x0036 (v1) ; store to current health
    jr      ra
    nop

; Call above function on Tatl timer
; Replaces
;   b       .+0x1C
;   sh      t3, 0x003E (v1)
.orga 0xD0A574
    jal     0x801C69FC
    sh      t3, 0x003E (v1)

; Reset health to max on death
; Replaces:
;   addiu   t5, r0, 0x0030
.orga 0xC40E18
    lh      t5, 0x0034 (v1)

.close
