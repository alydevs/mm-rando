using System;

namespace MMR.Randomizer.Attributes.Entrance
{
    public class EntranceTypeAttribute : Attribute
    {
        public EntranceType? Type { get; private set; }

        public EntranceTypeAttribute(EntranceType entranceType)
        {
            Type = entranceType;
        }
    }

    public enum EntranceType
    {
        Interior,
        Overworld,
        InteriorExit,
        Permanent,
        Dungeon,
        Boss,
        Trial,
        DungeonExit,
        TrialExit,
        OwlWarp,
        Telescope,
        Grotto,
        VoidRespawn
    }
}
