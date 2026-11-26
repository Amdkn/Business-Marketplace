// src/data/missions.repo.ts
// Hermes Mission Board repository (Marketplace tenant mission records).
// D4 forward-only — created alongside sql/08_hermes_missions.sql.

import { makeRepository } from './repository';
import type { Mission } from '../lib/types';

export const missionsRepo = makeRepository<Mission>('missions', []);
