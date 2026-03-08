#!/usr/bin/env node

const Database = require('better-sqlite3');

console.log('🔄 Migrating database to add quoted message columns...\n');

const db = new Database('./whatsapp_bot.db');

try {
    // Check if columns already exist
    const tableInfo = db.prepare("PRAGMA table_info(mota_queue)").all();
    const columnNames = tableInfo.map(col => col.name);

    if (!columnNames.includes('quoted_message_sender')) {
        db.exec(`
            ALTER TABLE mota_queue ADD COLUMN quoted_message_sender TEXT;
        `);
        console.log('✅ Added column: quoted_message_sender');
    } else {
        console.log('⏭️  Column already exists: quoted_message_sender');
    }

    if (!columnNames.includes('quoted_message_body')) {
        db.exec(`
            ALTER TABLE mota_queue ADD COLUMN quoted_message_body TEXT;
        `);
        console.log('✅ Added column: quoted_message_body');
    } else {
        console.log('⏭️  Column already exists: quoted_message_body');
    }

    if (!columnNames.includes('quoted_message_type')) {
        db.exec(`
            ALTER TABLE mota_queue ADD COLUMN quoted_message_type TEXT;
        `);
        console.log('✅ Added column: quoted_message_type');
    } else {
        console.log('⏭️  Column already exists: quoted_message_type');
    }

    console.log('\n🎉 Migration completed successfully!');

} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
} finally {
    db.close();
}
