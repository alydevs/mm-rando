using MMR.Randomizer.Attributes;
using MMR.Randomizer.Attributes.Entrance;

namespace MMR.Randomizer.GameObjects
{
    public enum Entrance
    {
        [Exit(Scene.InvertedStoneTower, 0)]
        [Spawn(Scene.InvertedStoneTowerTemple, 0)]
        EntranceStoneTowerTempleInvertedFromStoneTowerInverted,

        [Exit(Scene.Woodfall, 1)]
        [Spawn(Scene.WoodfallTemple, 0)]
        EntranceWoodfallTempleFromWoodfall,

        [Exit(Scene.Snowhead, 1)]
        [Spawn(Scene.SnowheadTemple, 0)]
        EntranceSnowheadTempleFromSnowhead, // should use the No Intro version if shorten cutscenes is enabled

        [Exit(Scene.GreatBayTemple, 0)]
        [ExitAddress(0xF155BA)]
        [Spawn(Scene.ZoraCape, 7)]
        EntranceZoraCapeFromGreatBayTemple,

        [Exit(Scene.WoodfallTemple, 0)]
        [Spawn(Scene.Woodfall, 1)]
        EntranceWoodfallFromWoodfallTempleEntrance,

        [ExitCutscene(Scene.ZoraCape, 0, 2)]
        [ExitCutscene(Scene.ZoraCape, 1, 2)]
        [ExitCutscene(Scene.GreatBayCutscene, 0, 0)]
        [Spawn(Scene.GreatBayTemple, 0)]
        EntranceGreatBayTempleFromZoraCape,

        [Exit(Scene.InvertedStoneTowerTemple, 0)]
        [Spawn(Scene.InvertedStoneTower, 1)]
        EntranceStoneTowerInvertedFromStoneTowerTempleInverted,

        [Exit(Scene.SnowheadTemple, 0)]
        [Spawn(Scene.Snowhead, 1)]
        EntranceSnowheadFromSnowheadTemple,

        [Spawn(Scene.MountainVillage, 7)]
        EntranceMountainVillageFromSnowheadClear, // one way

        [Spawn(Scene.ZoraCape, 8)]
        EntranceZoraCapeFromGreatBayTempleClear, // one way

        [Spawn(Scene.IkanaCanyon, 7)]
        EntranceIkanaCanyonFromIkanaClear, // one way

        [Spawn(Scene.WoodfallTemple, 1)]
        EntranceWoodfallTemplePrisonFromOdolwasLair, // one way

        [Exit(Scene.WoodfallTemple, 1)]
        [Spawn(Scene.OdolwasLair, 0)]
        EntranceOdolwasLairFromWoodfallTemple, // one way

        [Exit(Scene.SnowheadTemple, 1)]
        [Spawn(Scene.GohtsLair, 0)]
        EntranceGohtsLairFromSnowheadTemple, // one way

        [Exit(Scene.GreatBayTemple, 1)]
        [Spawn(Scene.GyorgsLair, 0)]
        EntranceGyorgsLairFromGreatBayTemple, // one way

        [Exit(Scene.InvertedStoneTowerTemple, 1)]
        [Spawn(Scene.TwinmoldsLair, 0)]
        EntranceTwinmoldsLairFromStoneTowerTempleInverted, // one way

        [ExitActorParams(Scene.TerminaField, 0, 0, 70)]
        //[ExitActorParams(Scene.TwinIslands, 0, 0, 1)]
        [SpawnActorParams(0x2055, 0x1F, 0x1F, 0, 0, 0)]
        [Spawn(Scene.Grottos, 0)]
        EntranceGrottoGossipOcean,

        [Spawn(0xFFFF)]
        [ExitPolygonType(Scene.Grottos, 2, 0, 6, 7)]
        EntranceTerminaFieldFromGrottoGossipOcean,

        [ExitActorParams(Scene.TerminaField, 0, 0, 73)]
        [SpawnActorParams(0x2055, 0x1F, 0x1F, 0, 0, 1)]
        [Spawn(Scene.Grottos, 1)]
        EntranceGrottoGossipSwamp,

        [Spawn(0xFFFF)]
        [ExitPolygonType(Scene.Grottos, 4, 0, 6, 7)]
        EntranceTerminaFieldFromGrottoGossipSwamp,

        [ExitActorParams(Scene.TerminaField, 0, 0, 76)]
        [SpawnActorParams(0x2055, 0x1F, 0x1F, 0, 0, 2)]
        [Spawn(Scene.Grottos, 2)]
        EntranceGrottoGossipCanyon,

        [Spawn(0xFFFF)]
        [ExitPolygonType(Scene.Grottos, 6, 0, 6, 7)]
        EntranceTerminaFieldFromGrottoGossipCanyon,

        [ExitActorParams(Scene.TerminaField, 0, 0, 74)]
        [SpawnActorParams(0x2055, 0x1F, 0x1F, 0, 0, 3)]
        [Spawn(Scene.Grottos, 3)]
        EntranceGrottoGossipMountain,

        [Spawn(0xFFFF)]
        [ExitPolygonType(Scene.Grottos, 8, 0, 6, 7)]
        EntranceTerminaFieldFromGrottoGossipMountain,

        [ExitActorParams(Scene.GreatBayCoast, 0, 0, 59)]
        [ExitActorParams(Scene.GreatBayCoast, 1, 0, 36)]
        [SpawnActorParams(0x2055, 0x17, 0x1F, 0, 0, 4)]
        [Spawn(0)]
        EntranceGrottoGenericGreatBayCoast,

        [ExitActorParams(Scene.MountainVillageSpring, 0, 1, 23)]
        [ExitActorParams(Scene.MountainVillageSpring, 1, 1, 2)]
        [SpawnActorParams(0x2055, 0x1B, 0x1F, 0, 0, 4)]
        [Spawn(0)]
        EntranceGrottoGenericMountainVillageSpring,

        [ExitActorParams(Scene.SouthernSwamp, 0, 1, 35)]
        [ExitActorParams(Scene.SouthernSwampClear, 0, 1, 27)]
        [SpawnActorParams(0x2055, 0x1D, 0x1F, 0, 0, 4)]
        [Spawn(0)]
        EntranceGrottoGenericSouthernSwamp,

        [ExitActorParams(Scene.RoadToSouthernSwamp, 0, 0, 45)]
        [SpawnActorParams(0x2055, 0x1E, 0x1F, 0, 0, 4)]
        [Spawn(0)]
        EntranceGrottoGenericRoadToSwamp,

        [ExitActorParams(Scene.TerminaField, 0, 0, 78)]
        [SpawnActorParams(0x2055, 0x1F, 0x1F, 0, 0, 4)]
        [Spawn(0)]
        EntranceGrottoGenericTerminaFieldGrass,

        [ExitActorParams(Scene.IkanaCanyon, 0, 2, 0)]
        [ExitActorParams(Scene.IkanaCanyon, 1, 2, 0)]
        [ExitActorParams(Scene.IkanaCanyon, 3, 2, 0)]
        [SpawnActorParams(0x2055, 0x14, 0x1F, 0, 0, 4)]
        [Spawn(0)]
        EntranceGrottoGenericIkanaCanyon,

        [ExitActorParams(Scene.WoodsOfMystery, 0, 2, 0)]
        [SpawnActorParams(0x2055, 0x1C, 0x1F, 0, 0, 4)]
        [Spawn(0)]
        EntranceGrottoGenericWoodsOfMystery,

        [ExitActorParams(Scene.ZoraCape, 0, 0, 61)]
        [ExitActorParams(Scene.ZoraCape, 1, 0, 56)]
        [SpawnActorParams(0x2055, 0x15, 0x1F, 0, 0, 4)]
        [Spawn(0)]
        EntranceGrottoGenericZoraCape,

        [ExitActorParams(Scene.RoadToIkana, 0, 0, 75)]
        [SpawnActorParams(0x2055, 0x16, 0x1F, 0, 0, 4)]
        [Spawn(0)]
        EntranceGrottoGenericRoadToIkana,

        [ExitActorParams(Scene.TerminaField, 0, 0, 77)]
        [SpawnActorParams(0x2055, 0x1A, 0x1F, 0, 0, 4)]
        [Spawn(0)]
        EntranceGrottoGenericTerminaFieldPillar,

        [ExitActorParams(Scene.IkanaGraveyard, 0, 1, 46)]
        [ExitActorParams(Scene.IkanaGraveyard, 1, 1, 3)]
        [SpawnActorParams(0x2055, 0x18, 0x1F, 0, 0, 4)]
        [Spawn(0)]
        EntranceGrottoGenericIkanaGraveyard,

        [ExitActorParams(Scene.PathToSnowhead, 0, 0, 4)]
        [ExitActorParams(Scene.PathToSnowhead, 1, 0, 16)]
        [SpawnActorParams(0x2055, 0x13, 0x1F, 0, 0, 4)]
        [Spawn(0)]
        EntranceGrottoGenericPathToSnowhead,

        [ExitActorParams(Scene.TwinIslands, 0, 0, 39)]
        [ExitActorParams(Scene.TwinIslandsSpring, 0, 0, 23)]
        [SpawnActorParams(0x2055, 0x19, 0x1F, 0, 0, 4)]
        [Spawn(0)]
        EntranceGrottoGenericTwinIslands,

        [ExitActorParams(Scene.TwinIslands, 0, 0, 0)]
        [ExitActorParams(Scene.TwinIslandsSpring, 0, 0, 29)]
        [SpawnActorParams(0x2055, 0x1F, 0x1F, 0, 0, 5)]
        [Spawn(Scene.Grottos, 5)]
        EntranceGrottoHotSpring,

        [Spawn(0xFFFF)]
        [ExitPolygonType(Scene.Grottos, 45, 0, 6, 7)]
        EntranceTwinIslandsFromGrottoHotSpring,

        [ExitActorParams(Scene.TerminaField, 0, 0, 71)]
        [SpawnActorParams(0x2055, 0x1F, 0x1F, 0, 0, 7)]
        [Spawn(Scene.Grottos, 7)]
        EntranceGrottoDodongo,

        [Spawn(0xFFFF)]
        [ExitPolygonType(Scene.Grottos, 23, 0, 6, 7)]
        EntranceTerminaFieldFromGrottoDodongo,

        [ExitActorParams(Scene.TerminaField, 0, 0, 75)]
        [ExitActorParams(Scene.TerminaField, 5, 0, 8)]
        [SpawnActorParams(0x2055, 0x1F, 0x1F, 0, 0, 9)]
        [Spawn(Scene.Grottos, 9)]
        EntranceGrottoDekuMerchant,

        [Spawn(0xFFFF)]
        [ExitPolygonType(Scene.Grottos, 30, 0, 6, 7)]
        EntranceTerminaFieldFromGrottoDekuMerchant,

        [ExitActorParams(Scene.GreatBayCoast, 0, 0, 14)]
        [ExitActorParams(Scene.GreatBayCoast, 1, 0, 37)]
        [SpawnActorParams(0x2055, 0x02, 0x1F, 0, 0, 10)]
        [Spawn(0)]
        EntranceGrottoCowGreatBayCoast,

        [ExitActorParams(Scene.TerminaField, 0, 0, 79)]
        [SpawnActorParams(0x2055, 0x00, 0x1F, 0, 0, 10)]
        [Spawn(0)]
        EntranceGrottoCowTerminaField,

        [ExitActorParams(Scene.TerminaField, 0, 0, 69)]
        [SpawnActorParams(0x2055, 0x1F, 0x1F, 0, 0, 11)]
        [Spawn(Scene.Grottos, 11)]
        EntranceGrottoBioBaba,

        [Spawn(0xFFFF)]
        [ExitPolygonType(Scene.Grottos, 36, 0, 6, 7)]
        EntranceTerminaFieldFromGrottoBioBaba,

        [ExitActorParams(Scene.TerminaField, 0, 0, 72)]
        [SpawnActorParams(0x2055, 0x1F, 0x1F, 0, 0, 13)]
        [Spawn(Scene.Grottos, 13)]
        EntranceGrottoPeahat,

        [Spawn(0xFFFF)]
        [ExitPolygonType(Scene.Grottos, 40, 0, 6, 7)]
        EntranceTerminaFieldFromGrottoPeahat,

        [Spawn(0xFFFF)]
        EntranceGrottoReturn,

        [Exit(Scene.DekuPalace, 6)]
        [SpawnActorParams(0x2055, 0x1F, 0x1F, 0, 0, 12)]
        [Spawn(Scene.Grottos, 12)]
        EntranceGrottoBeanSeller,

        [Spawn(Scene.DekuPalace, 9)]
        [ExitPolygonType(Scene.Grottos, 37, 0, 6, 7)]
        EntranceDekuPalaceFromBeanSellerGrotto,

        [Exit(Scene.NorthClockTown, 4)]
        [SpawnActorParams(0x2055, 0x1F, 0x1F, 0, 0, 6)]
        [Spawn(Scene.DekuPlayground, 0)]
        EntranceGrottoDekuPlayground,

        [Exit(Scene.DekuPlayground, 0)]
        [Spawn(Scene.NorthClockTown, 4)]
        EntranceNorthClockTownFromDekuPlayground,
    }
}
