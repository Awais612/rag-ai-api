-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "content" TEXT,
ALTER COLUMN "file_name" DROP NOT NULL,
ALTER COLUMN "mime_type" DROP NOT NULL,
ALTER COLUMN "file_path" DROP NOT NULL;
