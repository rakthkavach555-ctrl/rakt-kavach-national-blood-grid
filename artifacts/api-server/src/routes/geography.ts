import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, statesTable, districtsTable, blocksTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/geography/states", async (req, res) => {
  try {
    const states = await db.select().from(statesTable).where(eq(statesTable.isActive, true)).orderBy(statesTable.name);
    res.json({ states: states.map(s => ({ ...s, createdAt: s.createdAt.toISOString() })), total: states.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/geography/states/:stateCode/districts", async (req, res) => {
  try {
    const stateCode = req.params["stateCode"] as string;
    const districts = await db.select().from(districtsTable).where(eq(districtsTable.stateCode, stateCode)).orderBy(districtsTable.name);
    res.json({ districts: districts.map(d => ({ ...d, createdAt: d.createdAt.toISOString() })), total: districts.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/geography/districts/:districtCode/blocks", async (req, res) => {
  try {
    const districtCode = req.params["districtCode"] as string;
    const blocks = await db.select().from(blocksTable).where(eq(blocksTable.districtCode, districtCode)).orderBy(blocksTable.name);
    res.json({ blocks: blocks.map(b => ({ ...b, createdAt: b.createdAt.toISOString() })), total: blocks.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Hierarchical view: state → districts → blocks
router.get("/geography/hierarchy/:stateCode", async (req, res) => {
  try {
    const stateCode = req.params["stateCode"] as string;
    const [state] = await db.select().from(statesTable).where(eq(statesTable.code, stateCode)).limit(1);
    if (!state) { res.status(404).json({ error: "State not found" }); return; }
    const districts = await db.select().from(districtsTable).where(eq(districtsTable.stateCode, stateCode)).orderBy(districtsTable.name);
    const allBlocks = await db.select().from(blocksTable).where(eq(blocksTable.stateCode, stateCode));
    const blocksByDistrict = new Map<string, typeof allBlocks>();
    for (const block of allBlocks) {
      if (!blocksByDistrict.has(block.districtCode)) blocksByDistrict.set(block.districtCode, []);
      blocksByDistrict.get(block.districtCode)!.push(block);
    }
    const hierarchy = {
      state: { ...state, createdAt: state.createdAt.toISOString() },
      districts: districts.map(d => ({
        ...d, createdAt: d.createdAt.toISOString(),
        blocks: (blocksByDistrict.get(d.code) ?? []).map(b => ({ ...b, createdAt: b.createdAt.toISOString() })),
      })),
    };
    res.json(hierarchy);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
