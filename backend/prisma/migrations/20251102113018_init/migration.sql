-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "deleted_by" UUID,
    "role" "GroupRole" NOT NULL DEFAULT 'MEMBER',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "deleted_by" UUID,
    "description" TEXT NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillShare" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bill_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "amount" DOUBLE PRECISION NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "BillShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_created_by_idx" ON "User"("created_by");

-- CreateIndex
CREATE INDEX "User_updated_by_idx" ON "User"("updated_by");

-- CreateIndex
CREATE INDEX "User_deleted_by_idx" ON "User"("deleted_by");

-- CreateIndex
CREATE INDEX "Group_name_idx" ON "Group"("name");

-- CreateIndex
CREATE INDEX "Group_created_by_idx" ON "Group"("created_by");

-- CreateIndex
CREATE INDEX "Group_updated_by_idx" ON "Group"("updated_by");

-- CreateIndex
CREATE INDEX "Group_deleted_by_idx" ON "Group"("deleted_by");

-- CreateIndex
CREATE INDEX "GroupMember_group_id_idx" ON "GroupMember"("group_id");

-- CreateIndex
CREATE INDEX "GroupMember_user_id_idx" ON "GroupMember"("user_id");

-- CreateIndex
CREATE INDEX "GroupMember_created_by_idx" ON "GroupMember"("created_by");

-- CreateIndex
CREATE INDEX "GroupMember_updated_by_idx" ON "GroupMember"("updated_by");

-- CreateIndex
CREATE INDEX "GroupMember_deleted_by_idx" ON "GroupMember"("deleted_by");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_user_id_group_id_key" ON "GroupMember"("user_id", "group_id");

-- CreateIndex
CREATE INDEX "Bill_group_id_idx" ON "Bill"("group_id");

-- CreateIndex
CREATE INDEX "Bill_created_by_idx" ON "Bill"("created_by");

-- CreateIndex
CREATE INDEX "Bill_updated_by_idx" ON "Bill"("updated_by");

-- CreateIndex
CREATE INDEX "Bill_deleted_by_idx" ON "Bill"("deleted_by");

-- CreateIndex
CREATE INDEX "BillShare_bill_id_idx" ON "BillShare"("bill_id");

-- CreateIndex
CREATE INDEX "BillShare_user_id_idx" ON "BillShare"("user_id");

-- CreateIndex
CREATE INDEX "BillShare_created_by_idx" ON "BillShare"("created_by");

-- CreateIndex
CREATE INDEX "BillShare_updated_by_idx" ON "BillShare"("updated_by");

-- CreateIndex
CREATE INDEX "BillShare_deleted_by_idx" ON "BillShare"("deleted_by");

-- CreateIndex
CREATE UNIQUE INDEX "BillShare_bill_id_user_id_key" ON "BillShare"("bill_id", "user_id");
