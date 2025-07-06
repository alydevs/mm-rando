using MMR.Common.Extensions;
using MMR.Randomizer.Attributes.Entrance;
using MMR.Randomizer.GameObjects;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MMR.Randomizer.Extensions
{
    public static class EntranceExtensions
    {
        public static ushort SpawnId(this Entrance entrance)
        {
            return entrance.GetAttribute<SpawnAttribute>().SpawnId;
        }

        public static IEnumerable<Tuple<int, byte>> ExitIndices(this Entrance entrance)
        {
            return entrance.GetAttributes<ExitAttribute>().Select(ea => new Tuple<int, byte>(ea.SceneId, ea.ExitIndex));
        }

        public static IEnumerable<Tuple<int, byte, byte>> ExitCutscenes(this Entrance entrance)
        {
            return entrance.GetAttributes<ExitCutsceneAttribute>().Select(eca => new Tuple<int, byte, byte>(eca.SceneId, eca.SetupIndex, eca.CutsceneIndex));
        }

        public static IEnumerable<int> ExitAddresses(this Entrance entrance)
        {
            return entrance.GetAttributes<ExitAddressAttribute>().Select(eaa => eaa.Address);
        }
    }
}
