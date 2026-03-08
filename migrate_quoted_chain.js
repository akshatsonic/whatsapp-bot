#!/usr/bin/env node

const Database = require('better-sqlite3');

console.log('🔄 Migrating database to add quoted_chain column...\n');

const db = new Database('./whatsapp_bot.db');

try {
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(mota_queue)").all();
    const columnNames = tableInfo.map(col => col.name);

    if (!columnNames.includes('quoted_chain')) {
        db.exec(`
            ALTER TABLE mota_queue ADD COLUMN quoted_chain TEXT;
        `);
        console.log('✅ Added column: quoted_chain (stores JSON array of quoted messages)');
    } else {
        console.log('⏭️  Column already exists: quoted_chain');
    }

    console.log('\n🎉 Migration completed successfully!');

} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
} finally {
    db.close();
}
