from app.db import prisma
from app.models.users import UserOut

class SummaryService:
    async def get_user_summary(self, user_id: str):
        # 1. Total Groups
        group_count = await prisma.groupmember.count(
            where={"user_id": user_id, "deleted_at": None}
        )

        # 2. Total Owed (Others owe you) - Sum of unpaid shares where you are the payer and user is not you
        owed_result = await prisma.billshare.group_by(
            by=["user_id"],
            sum={"amount": True},
            where={
                "bill": {
                    "paid_by": user_id,
                    "deleted_at": None
                },
                "user_id": {"not": user_id},
                "paid": False
            }
        )
        total_owed = sum(item["_sum"]["amount"] or 0 for item in owed_result)

        # 3. Total Owe (You owe others) - Sum of unpaid shares where you are not the payer and user is you
        owe_result = await prisma.billshare.group_by(
            by=["user_id"],
            sum={"amount": True},
            where={
                "bill": {
                    "paid_by": {"not": user_id},
                    "deleted_at": None
                },
                "user_id": user_id,
                "paid": False
            }
        )
        total_owe = sum(item["_sum"]["amount"] or 0 for item in owe_result)

        # 4. Recent Activity (Last 5 bills)
        recent_bills = await prisma.bill.find_many(
            where={
                "OR": [
                    {"paid_by": user_id},
                    {"shares": {"some": {"user_id": user_id}}}
                ],
                "deleted_at": None
            },
            include={
                "payer": True,
                "group": True
            },
            order={"created_at": "desc"},
            take=5
        )

        # 5. Friends (People you share groups with)
        # This is a bit complex in Prisma without raw queries if we want unique friends.
        # Let's just get the last 5 unique people you've been in groups with.
        group_members = await prisma.groupmember.find_many(
            where={
                "group": {
                    "members": {
                        "some": {"user_id": user_id}
                    }
                },
                "user_id": {"not": user_id},
                "deleted_at": None
            },
            include={"user": True},
            take=10
        )
        
        friends_map = {}
        for gm in group_members:
            if gm.user_id not in friends_map:
                friends_map[gm.user_id] = {
                    "id": gm.user_id,
                    "name": gm.user.name,
                    "email": gm.user.email
                }
        
        return {
            "total_owed": total_owed,
            "total_owe": total_owe,
            "group_count": group_count,
            "recent_activity": [
                {
                    "id": b.id,
                    "description": b.description,
                    "amount": b.total_amount,
                    "date": b.created_at,
                    "payer_name": b.payer.name,
                    "group_name": b.group.name,
                    "type": "lent" if b.paid_by == user_id else "borrowed"
                } for b in recent_bills
            ],
            "friends": list(friends_map.values())[:5]
        }
