<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Department;
use App\Models\Unit;

class departmentController extends Controller
{
    public function uploadDepartmentImage(Request $request)
    {
        try {
            $folder = "departments";
            $full_destination_path = public_path($folder);
            $file_name = $request->sku_department . "-" . date("dmyis") . "-department.jpg";
            $request->picture->move($full_destination_path, $file_name);

            $final_name_mini = $folder . "/" . $file_name;

            // update table infos
            $department = Department::find($request->sku_department);
            $department->image = $final_name_mini;
            $department->save();

            return response()->json(
                [
                    'full_url' => url($final_name_mini),
                    'message' => "Mise a jour image effectuée",
                    'code' => 200
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'full_url' => "",
                    'message' => "Erreur envoi photo au serveur.",
                    'code' => 500
                ]
            );
        }
    }

    public function store(Request $request)
    {
        try {
            $department = new Department();
            $data = $request->all();

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $department->$key = json_encode($value);
                } else {
                    if ($key != "sku_department" && $value != "null") {
                        $department->$key = $value;
                    }
                }
            }

            $department->save();
            return response()->json(
                [
                    'message' => "Enregistrement department Effectué",
                    'code' => 200
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de l'enregistrement",
                    'code' => 500
                ]
            );
        }
    }

    public function update(Request $request)
    {
        try {
            $department = Department::find($request->id);
            $data = $request->all();
            foreach ($data as $key => $value) {
                if ($key != "sku_department" && $key != "sku_department" && $key != "created_at" && $key != "updated_at" && $key != "id" && $value != "null") {
                    if (is_array($value)) {
                        // convert to json string
                        $department->$key = json_encode($value);
                    } else {
                        if ($key != "sku_department" && $value != "null") {
                            $department->$key = $value;
                        }
                    }
                }
            }

            $department->save();
            return response()->json(
                [
                    'message' => "Mise a jour department effectuée",
                    'code' => 200
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de modification",
                    'code' => 500
                ]
            );
        }
    }

    public function index(Request $request)
    {
        try {
            $condition_array = [];
            // status filter
            $statusFilter = 0;
            if (isset($request['status']) and !empty($request['status'])) {
                if ($request['status'] == "active") {
                    $statusFilter = 1;
                } elseif ($request['status'] == "inactive") {
                    $statusFilter = 2;
                } else {
                    $statusFilter = 0;
                }
                $condition_array['status'] =  $statusFilter;
            }

            // type filter
            if (isset($request['type']) and !empty($request['type'])) {
                $condition_array['type'] = $request['type'];
            }
            // attribute filter
            if (isset($request['attribute']) and !empty($request['attribute'])) {
                $condition_array[$request['attribute']] = 1;
            }

            // filter
            if (isset($request['sortBy']) and !empty($request['sortBy'])) {
                // $condition_array[$request['sortBy']] = 1;
            }

            // page filter
            if (isset($request['page']) and !empty($request['page'])) {
                // $condition_array[$request['page']] = 1;
            }

            $sortField = (isset($request['sortBy']) ? $request['sortBy'] : 'id');
            $sortMethod = ($request['sortDesc'] == true ? 'ASC' : 'DESC');

            // paging limit filter
            if (isset($request['perPage']) and !empty($request['perPage'])) {
                // $condition_array[$request['perPage']] = $request['perPage'];
                // ->where([['title', 'LIKE', "%" . $text_val . "%"]])

                if ($request['page'] == 1) {
                    // premiere page
                    $departmentsInfos = Department::where($condition_array)
                        ->orderBy($sortField, $sortMethod)->skip(0)
                        ->take($request['perPage'])
                        ->get();
                } else {
                    $departmentsInfos = Department::where($condition_array)
                        ->orderBy($sortField, $sortMethod)
                        ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                        ->take($request['perPage'])
                        ->get();
                }

                // convert json menus to normal text
                for ($i = 0; $i < count($departmentsInfos); $i++) {
                    # code...
                    $menus = json_decode($departmentsInfos[$i]['modules'], true);
                    $menuHtml = "";
                    $counter = 0;
                    foreach ($menus as $key => $value) {
                        $counter++;
                        $menuHtml .= " " . $counter . ") " . $value['name'];
                    }
                    $departmentsInfos[$i]['modules'] = $menuHtml;
                }

                // custom return
                return response()->json(
                    [
                        'data' => $departmentsInfos,
                        'totalData' => count(Department::all()),
                        'message' => 'Liste des elements',
                        'code' => 200
                    ]
                );
            } else {
                // get all
                $condition_array = ['status' => null];
                return json_encode(Department::where($condition_array)->get());
            }
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des données",
                    'code' => 500
                ]
            );
        }
    }

    public function getAllMenus(Request $request)
    {
        try {

            // old version
            // construct default super-admin permissions
            $fullMenus = [];
            $departments = Department::orderBy('id', 'asc')->get();
            for ($i_d = 0; $i_d < count($departments); $i_d++) {
                $department = $departments[$i_d];
                $departmentModules = json_decode($department['modules']);

                // boucle de modules
                $permissions = [];
                for ($i_m = 0; $i_m < count($departmentModules); $i_m++) {

                    $module = $departmentModules[$i_m];

                    $haveFolder = false;
                    if (isset($module->folder)) {
                        $haveFolder = true;
                    };
                    // add module to permissions
                    $permissions[] = array(
                        "module" => $module->name,
                        "route" => $module->route,
                        "ressource" => $module->route,
                        "create" => true,
                        "read" => true,
                        "update" => true,
                        "delete" => true,
                        "folder" => $haveFolder
                    );
                }

                // add department to output
                $fullMenus[] = array(
                    "name" => $department['name'],
                    "route" => $department['route'],
                    "icon" => $department['icon'],
                    "modules" => $permissions
                );
            }
            // old version end

            return response()->json(
                [
                    'message' => "menus",
                    'data' => $fullMenus,
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des menus",
                    'code' => 500
                ]
            );
        }
    }

    public function show($id)
    {
        try {
            $departmentInfos = Department::find($id);
            // $full_destination_url = url($departmentInfos["image"]);
            // append image full url //
            // $departmentInfos['image_url'] = $full_destination_url;
            // $departmentInfos['modules'] = '[{"sku_department_parent":null,"sku_module":"module-1663742309717","name":"A propos du logiciel","route":"get-start","icon":null}]';
            return response()->json(
                [
                    'data' => $departmentInfos,
                    'message' => "Information de l'element",
                    'code' => 200
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des informations de l'element",
                    'code' => 500
                ]
            );
        }
    }

    public function destroy($id)
    {
        try {
            $department = Department::find($id);
            $department->delete();
            return response()->json(
                [
                    'message' => "Suppression de l'element effectuée",
                    'code' => 200
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de la suppression",
                    'code' => 500
                ]
            );
        }
    }
}
