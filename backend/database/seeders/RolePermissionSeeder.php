<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Roles and permissions mirror the Role & Permission Matrix (spec §8).
     * Roles are managed by Spatie Laravel Permission.
     */
    public function run(): void
    {
        $permissions = [
            'make-sales',
            'view-sales',
            'return-sales',
            'manage-products',
            'adjust-stock',
            'manage-customers',
            'manage-suppliers',
            'create-purchase',
            'manage-expenses',
            'view-reports',
            'manage-users',
            'system-settings',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $roles = [
            'Super Admin' => $permissions, // everything
            'Admin' => array_diff($permissions, ['system-settings']),
            'Manager' => [
                'make-sales', 'view-sales', 'return-sales', 'manage-products',
                'adjust-stock', 'manage-customers', 'create-purchase',
                'manage-expenses', 'view-reports',
            ],
            'Cashier' => ['make-sales'],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($rolePermissions);
        }
    }
}
