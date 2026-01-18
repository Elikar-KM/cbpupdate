<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Contracts\Role as ContractsRole;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permission for stores
        $addUser = 'add user';
        $editUser = 'edit user';
        $deleteUser = 'delete user';

        $addLawyer = 'add lawyer';
        $editLawyer = 'edit lawyer';
        $deleteLawyer = 'delete lawyer';

        $approveStore = 'approve user';
        $suspendStore = 'suspend user';

        $addStore = 'add store';
        $editStore = 'edit store';
        $deleteStore = 'delete store';

        $addProductLine = 'add productline';
        $editProductLine = 'edit productline';
        $deleteProductLine = 'delete productline';

        $addBrand = 'add brand';
        $editBrand = 'edit brand';
        $deleteBrand = 'delete brand';

        $addProduct = 'add product';
        $editProduct = 'edit product';
        $deleteProduct = 'delete product';
        $viewProduct = 'view product';

        // create permission for stores
        Permission::create(['name' => $addLawyer]);
        Permission::create(['name' => $editLawyer]);
        Permission::create(['name' => $deleteLawyer]);

        // create permission for stores
        Permission::create(['name' => $addUser]);
        Permission::create(['name' => $editUser]);
        Permission::create(['name' => $deleteUser]);

        // store qpproval permissions
        Permission::create(['name' => $approveStore]);
        Permission::create(['name' => $suspendStore]);

        // manage store permissions
        Permission::create(['name' => $addStore]);
        Permission::create(['name' => $editStore]);
        Permission::create(['name' => $deleteStore]);

        // manage brands
        Permission::create(['name' => $addBrand]);
        Permission::create(['name' => $editBrand]);
        Permission::create(['name' => $deleteBrand]);

        // manage product lines permissions
        Permission::create(['name' => $addProductLine]);
        Permission::create(['name' => $editProductLine]);
        Permission::create(['name' => $deleteProductLine]);

        // manage product permission
        Permission::create(['name' => $addProduct]);
        Permission::create(['name' => $editProduct]);
        Permission::create(['name' => $deleteProduct]);
        Permission::create(['name' => $viewProduct]);

        // define roles
        $coordinator = 'coordinator';
        $superAdmin = 'super-admin';
        $financeAdmin = 'finance-admin';
        $jcAdmin = 'judicial-clinic-admin';
        $rhAdmin = 'rh-admin';
        $logisticAdmin = 'logistic-admin';
        $projectManagerAdmin = 'project-manager-admin';
        $webmaster = 'webmaster';
        $systemAdmin = 'system-admin';
        $storeOwner = 'store-owner';
        $storeAdmin = 'store-admin';
        $agent = 'agent'; 

        Role::create(['name' => $coordinator])
            ->givePermissionTo(Permission::all());

        Role::create(['name' => $superAdmin])
            ->givePermissionTo(Permission::all());

        Role::create(['name' => $systemAdmin])
            ->givePermissionTo([
                $addUser,
                $editUser,
                $deleteUser,
                $addStore,
                $editStore,
                $deleteStore,
                $approveStore,
                $suspendStore,
            ]);

        Role::create(['name' => $financeAdmin])
            ->givePermissionTo([
                $addUser,
            ]);

        Role::create(['name' => $rhAdmin])
            ->givePermissionTo([
                $addUser,
            ]);

        Role::create(['name' => $logisticAdmin])
            ->givePermissionTo([
                $addUser,
            ]);

        Role::create(['name' => $jcAdmin])
            ->givePermissionTo([
                $addUser,
                $addProduct,
            ]);

        Role::create(['name' => $projectManagerAdmin])
            ->givePermissionTo([
                $addUser,
            ]);

        Role::create(['name' => $webmaster])
            ->givePermissionTo([
                $addUser,
            ]);

        Role::create(['name' => $agent])
            ->givePermissionTo([
                $viewProduct,
            ]);

        Role::create(['name' => $storeOwner])
            ->givePermissionTo([
                $addStore,
                $editStore,
                $deleteStore,
                $addBrand,
                $editBrand,
                $deleteBrand,
                $addProductLine,
                $editProductLine,
                $deleteProductLine,
                $addProduct,
                $editProduct,
                $deleteProduct,
            ]);

        Role::create(['name' => $storeAdmin])
            ->givePermissionTo([
                $addStore,
                $editStore,
                $deleteStore,
                $editBrand,
                $editProductLine,
                $addProduct,
                $editProduct,
                $deleteProduct,
            ]); 

        // create permissions
        /* Permission::create(['name' => 'edit articles']);
        Permission::create(['name' => 'delete articles']);
        Permission::create(['name' => 'publish articles']);
        Permission::create(['name' => 'unpublish articles']); */


        // this can be done as separate statements
        /*  $role = Role::create(['name' => 'writer']);
        $role->givePermissionTo('edit articles');

        // or may be done by chaining
        $role = Role::create(['name' => 'moderator'])
            ->givePermissionTo(['publish articles', 'unpublish articles']);

        $role = Role::create(['name' => 'super-admin']);
        $role->givePermissionTo(Permission::all()); */
    }
}
