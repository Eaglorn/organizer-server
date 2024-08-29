-- CreateTable
CREATE TABLE "Storage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VicoMain" (
    "id" SERIAL NOT NULL,
    "dateTimeStart" INTEGER NOT NULL,
    "dateTimeEnd" INTEGER NOT NULL,
    "objectInitiator" TEXT NOT NULL,
    "objectInvited" TEXT[],
    "typeVico" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "departamentInitiator" TEXT NOT NULL,
    "departamentInvited" TEXT[],
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "videoRecord" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VicoMain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VicoArchive" (
    "id" SERIAL NOT NULL,
    "dateTimeStart" INTEGER NOT NULL,
    "dateTimeEnd" INTEGER NOT NULL,
    "objectInitiator" TEXT NOT NULL,
    "objectInvited" TEXT[],
    "typeVico" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "departamentInitiator" TEXT NOT NULL,
    "departamentInvited" TEXT[],
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "videoRecord" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VicoArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "role" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscribe" (
    "id" SERIAL NOT NULL,
    "object" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "departament" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "Subscribe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscribe_profileId_key" ON "Subscribe"("profileId");

-- AddForeignKey
ALTER TABLE "Subscribe" ADD CONSTRAINT "Subscribe_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
