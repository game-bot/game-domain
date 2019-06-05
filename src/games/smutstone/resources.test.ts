import test from "ava";
import { createGameResourcesFromRewards } from "./resources";

test("createResourcesStatsFromRewards", t => {
  const rewards = [
    { i: [[2082, 8]] },
    { r: { gold: 8000 } },
    { cards: [[43, null, null, 2]] },
    { cards: [[45, null, null, 2]] },
    { cards: [[26, null, null, 3]] },
    { cards: [[11, null, null, 6]] },
    { r: { energy: 75 } },
    { i: [[2002, 6]] },
    { cards: [[32, null, null, 3]] },
    { cards: [[31, null, null, 3]] },
    { p: 100 }
  ];

  const resources = createGameResourcesFromRewards(rewards);

  const data = resources.getData();

  t.is(data.cards, 19, "19 cards");
  t.is(data.energy, 75, "75 energy");
  t.is(data.gold, 8000, "8000 gold");
  t.is(data.items, 14, "14 items");
  t.is(data.tournament_points, 100, "100 tournament_points");
});
