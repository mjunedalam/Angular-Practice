"""Optional Temporal worker registration; server integration is not tested.

Register IncidentWorkflow and graph_step on one task queue. External API must
persist an authenticated approval using capstone_lab.approve BEFORE signaling
its ID. Shared durable volume and single activity writer per incident required.
"""
import asyncio
from datetime import timedelta
from temporalio import activity, workflow
from temporalio.common import RetryPolicy
with workflow.unsafe.imports_passed_through():
    from capstone_lab import step

@activity.defn
async def graph_step(request: dict) -> str:
    return await asyncio.to_thread(step, request['folder'], request.get('decision'))

@workflow.defn
class IncidentWorkflow:
    def __init__(self):
        self.decision = None

    @workflow.signal
    def approval_recorded(self, approval_id: str):
        # A signal is a pointer, never authority. Domain service revalidates it.
        if self.decision is None:
            self.decision = approval_id

    @workflow.run
    async def run(self, folder: str) -> str:
        async def advance():
            return await workflow.execute_activity(
                graph_step, {'folder': folder, 'decision': self.decision},
                start_to_close_timeout=timedelta(seconds=30),
                schedule_to_close_timeout=timedelta(minutes=2),
                retry_policy=RetryPolicy(maximum_attempts=3),
                cancellation_type=workflow.ActivityCancellationType.WAIT_CANCELLATION_COMPLETED,
            )
        status = await advance()
        if status == 'paused':
            try:
                await workflow.wait_condition(lambda: self.decision is not None,
                                              timeout=timedelta(minutes=15))
            except asyncio.TimeoutError:
                return 'approval-timeout'
            status = await advance()
        return status
