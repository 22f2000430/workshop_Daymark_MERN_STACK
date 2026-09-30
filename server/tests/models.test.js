import test from 'node:test';
import assert from 'node:assert/strict';
import { Task } from '../src/models/Task.js';
import { FocusSession } from '../src/models/FocusSession.js';

test('tasks validate date-only values and integer estimates', () => {
  const task = new Task({ title: 'Read chapter', scheduledDate: '2026-09-30', estimateMinutes: 25, userId: '507f1f77bcf86cd799439011' });
  assert.equal(task.validateSync(), undefined);
  const invalid = new Task({ title: 'Read chapter', scheduledDate: '30-09-2026', estimateMinutes: 25, userId: '507f1f77bcf86cd799439011' });
  assert.ok(invalid.validateSync().errors.scheduledDate);
});

test('focus sessions reject an end before the start', () => {
  const session = new FocusSession({ userId: '507f1f77bcf86cd799439011', startedAt: '2026-09-30T10:00:00Z', endedAt: '2026-09-30T09:00:00Z', durationMinutes: 25 });
  assert.ok(session.validateSync().errors.endedAt);
});
