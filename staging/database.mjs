import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
export async function createTestDatabase(){
 const db=new PGlite();
 await db.exec(readFileSync('staging/schema.sql','utf8'));
 for(const file of ['financial-ids','optimistic-writes','optimistic-store','atomic-operations'])await db.exec(readFileSync(`scripts/2026-09-26-${file}.sql`,'utf8'));
 await db.exec(readFileSync('scripts/2026-09-27-audit.sql','utf8'));
 await db.exec(readFileSync('scripts/2026-09-27-cash.sql','utf8'));
 await db.exec(readFileSync('scripts/2026-09-27-backup.sql','utf8'));
 await db.exec("SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false); SET ROLE authenticated;");
 return db;
}
