<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->ensureIndex('vehicles', 'vehicles_user_id_index', ['user_id']);
        $this->ensureIndex('maintenance_orders', 'maintenance_orders_user_id_index', ['user_id']);
        $this->ensureIndex('spare_parts', 'spare_parts_user_id_index', ['user_id']);
        $this->ensureIndex('suppliers', 'suppliers_user_id_index', ['user_id']);
        $this->ensureIndex('purchase_orders', 'purchase_orders_user_id_index', ['user_id']);
        $this->ensureIndex('alerts', 'alerts_user_id_index', ['user_id']);
        $this->ensureIndex('repair_guides', 'repair_guides_user_id_index', ['user_id']);
        $this->ensureIndex('inspections', 'inspections_user_id_index', ['user_id']);
        $this->ensureIndex('trips', 'trips_user_id_index', ['user_id']);
        $this->ensureIndex('documents', 'documents_user_id_index', ['user_id']);

        $this->dropIndexIfExists('vehicles', 'vehicles_user_id_plate_unique');
        $this->dropIndexIfExists('maintenance_orders', 'maintenance_orders_user_id_order_number_unique');
        $this->dropIndexIfExists('maintenance_orders', 'maintenance_orders_user_id_status_index');
        $this->dropIndexIfExists('maintenance_orders', 'maintenance_orders_user_id_priority_index');
        $this->dropIndexIfExists('spare_parts', 'spare_parts_user_id_sku_unique');
        $this->dropIndexIfExists('spare_parts', 'spare_parts_user_id_part_number_unique');
        $this->dropIndexIfExists('spare_parts', 'spare_parts_user_id_category_index');
        $this->dropIndexIfExists('suppliers', 'suppliers_user_id_name_unique');
        $this->dropIndexIfExists('suppliers', 'suppliers_user_id_name_index');
        $this->dropIndexIfExists('purchase_orders', 'purchase_orders_user_id_order_number_unique');
        $this->dropIndexIfExists('purchase_orders', 'purchase_orders_user_id_status_index');
        $this->dropIndexIfExists('purchase_orders', 'purchase_orders_user_id_priority_index');
        $this->dropIndexIfExists('alerts', 'alerts_user_id_status_index');
        $this->dropIndexIfExists('alerts', 'alerts_user_id_type_index');
        $this->dropIndexIfExists('alerts', 'alerts_user_id_severity_index');
        $this->dropIndexIfExists('repair_guides', 'repair_guides_user_id_category_index');
        $this->dropIndexIfExists('repair_guides', 'repair_guides_user_id_type_index');
        $this->dropIndexIfExists('inspections', 'inspections_user_id_overall_status_index');
        $this->dropIndexIfExists('inspections', 'inspections_user_id_inspection_date_index');
        $this->dropIndexIfExists('trips', 'trips_user_id_status_index');
        $this->dropIndexIfExists('documents', 'documents_user_id_document_type_index');
        $this->dropIndexIfExists('documents', 'documents_user_id_expiration_date_index');

        $this->ensureIndex('vehicles', 'vehicles_company_id_plate_unique', ['company_id', 'plate'], true);

        $this->ensureIndex('maintenance_orders', 'maintenance_orders_company_id_order_number_unique', ['company_id', 'order_number'], true);
        $this->ensureIndex('maintenance_orders', 'maintenance_orders_company_id_status_index', ['company_id', 'status']);
        $this->ensureIndex('maintenance_orders', 'maintenance_orders_company_id_priority_index', ['company_id', 'priority']);

        $this->ensureIndex('spare_parts', 'spare_parts_company_id_sku_unique', ['company_id', 'sku'], true);
        $this->ensureIndex('spare_parts', 'spare_parts_company_id_part_number_unique', ['company_id', 'part_number'], true);
        $this->ensureIndex('spare_parts', 'spare_parts_company_id_category_index', ['company_id', 'category']);

        $this->ensureIndex('suppliers', 'suppliers_company_id_name_unique', ['company_id', 'name'], true);
        $this->ensureIndex('suppliers', 'suppliers_company_id_name_index', ['company_id', 'name']);

        $this->ensureIndex('purchase_orders', 'purchase_orders_company_id_order_number_unique', ['company_id', 'order_number'], true);
        $this->ensureIndex('purchase_orders', 'purchase_orders_company_id_status_index', ['company_id', 'status']);
        $this->ensureIndex('purchase_orders', 'purchase_orders_company_id_priority_index', ['company_id', 'priority']);

        $this->ensureIndex('alerts', 'alerts_company_id_status_index', ['company_id', 'status']);
        $this->ensureIndex('alerts', 'alerts_company_id_type_index', ['company_id', 'type']);
        $this->ensureIndex('alerts', 'alerts_company_id_severity_index', ['company_id', 'severity']);

        $this->ensureIndex('repair_guides', 'repair_guides_company_id_category_index', ['company_id', 'category']);
        $this->ensureIndex('repair_guides', 'repair_guides_company_id_type_index', ['company_id', 'type']);

        $this->ensureIndex('inspections', 'inspections_company_id_overall_status_index', ['company_id', 'overall_status']);
        $this->ensureIndex('inspections', 'inspections_company_id_inspection_date_index', ['company_id', 'inspection_date']);

        $this->ensureIndex('trips', 'trips_company_id_status_index', ['company_id', 'status']);

        $this->ensureIndex('documents', 'documents_company_id_document_type_index', ['company_id', 'document_type']);
        $this->ensureIndex('documents', 'documents_company_id_expiration_date_index', ['company_id', 'expiration_date']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->dropIndexIfExists('vehicles', 'vehicles_company_id_plate_unique');
        $this->dropIndexIfExists('maintenance_orders', 'maintenance_orders_company_id_order_number_unique');
        $this->dropIndexIfExists('maintenance_orders', 'maintenance_orders_company_id_status_index');
        $this->dropIndexIfExists('maintenance_orders', 'maintenance_orders_company_id_priority_index');
        $this->dropIndexIfExists('spare_parts', 'spare_parts_company_id_sku_unique');
        $this->dropIndexIfExists('spare_parts', 'spare_parts_company_id_part_number_unique');
        $this->dropIndexIfExists('spare_parts', 'spare_parts_company_id_category_index');
        $this->dropIndexIfExists('suppliers', 'suppliers_company_id_name_unique');
        $this->dropIndexIfExists('suppliers', 'suppliers_company_id_name_index');
        $this->dropIndexIfExists('purchase_orders', 'purchase_orders_company_id_order_number_unique');
        $this->dropIndexIfExists('purchase_orders', 'purchase_orders_company_id_status_index');
        $this->dropIndexIfExists('purchase_orders', 'purchase_orders_company_id_priority_index');
        $this->dropIndexIfExists('alerts', 'alerts_company_id_status_index');
        $this->dropIndexIfExists('alerts', 'alerts_company_id_type_index');
        $this->dropIndexIfExists('alerts', 'alerts_company_id_severity_index');
        $this->dropIndexIfExists('repair_guides', 'repair_guides_company_id_category_index');
        $this->dropIndexIfExists('repair_guides', 'repair_guides_company_id_type_index');
        $this->dropIndexIfExists('inspections', 'inspections_company_id_overall_status_index');
        $this->dropIndexIfExists('inspections', 'inspections_company_id_inspection_date_index');
        $this->dropIndexIfExists('trips', 'trips_company_id_status_index');
        $this->dropIndexIfExists('documents', 'documents_company_id_document_type_index');
        $this->dropIndexIfExists('documents', 'documents_company_id_expiration_date_index');

        $this->ensureIndex('vehicles', 'vehicles_user_id_plate_unique', ['user_id', 'plate'], true);

        $this->ensureIndex('maintenance_orders', 'maintenance_orders_user_id_order_number_unique', ['user_id', 'order_number'], true);
        $this->ensureIndex('maintenance_orders', 'maintenance_orders_user_id_status_index', ['user_id', 'status']);
        $this->ensureIndex('maintenance_orders', 'maintenance_orders_user_id_priority_index', ['user_id', 'priority']);

        $this->ensureIndex('spare_parts', 'spare_parts_user_id_sku_unique', ['user_id', 'sku'], true);
        $this->ensureIndex('spare_parts', 'spare_parts_user_id_part_number_unique', ['user_id', 'part_number'], true);
        $this->ensureIndex('spare_parts', 'spare_parts_user_id_category_index', ['user_id', 'category']);

        $this->ensureIndex('suppliers', 'suppliers_user_id_name_unique', ['user_id', 'name'], true);
        $this->ensureIndex('suppliers', 'suppliers_user_id_name_index', ['user_id', 'name']);

        $this->ensureIndex('purchase_orders', 'purchase_orders_user_id_order_number_unique', ['user_id', 'order_number'], true);
        $this->ensureIndex('purchase_orders', 'purchase_orders_user_id_status_index', ['user_id', 'status']);
        $this->ensureIndex('purchase_orders', 'purchase_orders_user_id_priority_index', ['user_id', 'priority']);

        $this->ensureIndex('alerts', 'alerts_user_id_status_index', ['user_id', 'status']);
        $this->ensureIndex('alerts', 'alerts_user_id_type_index', ['user_id', 'type']);
        $this->ensureIndex('alerts', 'alerts_user_id_severity_index', ['user_id', 'severity']);

        $this->ensureIndex('repair_guides', 'repair_guides_user_id_category_index', ['user_id', 'category']);
        $this->ensureIndex('repair_guides', 'repair_guides_user_id_type_index', ['user_id', 'type']);

        $this->ensureIndex('inspections', 'inspections_user_id_overall_status_index', ['user_id', 'overall_status']);
        $this->ensureIndex('inspections', 'inspections_user_id_inspection_date_index', ['user_id', 'inspection_date']);

        $this->ensureIndex('trips', 'trips_user_id_status_index', ['user_id', 'status']);

        $this->ensureIndex('documents', 'documents_user_id_document_type_index', ['user_id', 'document_type']);
        $this->ensureIndex('documents', 'documents_user_id_expiration_date_index', ['user_id', 'expiration_date']);
    }

    private function ensureIndex(string $table, string $index, array $columns, bool $unique = false): void
    {
        $exists = DB::selectOne(
            'select 1 from information_schema.statistics where table_schema = database() and table_name = ? and index_name = ? limit 1',
            [$table, $index]
        );

        if ($exists) {
            return;
        }

        $columnList = implode(', ', array_map(fn (string $column) => "`{$column}`", $columns));
        $statement = $unique ? 'CREATE UNIQUE INDEX' : 'CREATE INDEX';
        DB::statement(sprintf('%s `%s` ON `%s` (%s)', $statement, $index, $table, $columnList));
    }

    private function dropIndexIfExists(string $table, string $index): void
    {
        $exists = DB::selectOne(
            'select 1 from information_schema.statistics where table_schema = database() and table_name = ? and index_name = ? limit 1',
            [$table, $index]
        );

        if (!$exists) {
            return;
        }

        DB::statement(sprintf('DROP INDEX `%s` ON `%s`', $index, $table));
    }
};
