<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\File;
use App\Http\Controllers\FunctionCollection;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class FileController extends Controller
{
    public function index(Request $request)
    {
        try {
            // check if user exists and logged in
            if (!$user = auth()->user()) {
                throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            }
        } catch (HttpException $th) {
            throw $th;
        }

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
                    $filesInfos = File::where($condition_array)
                        ->orderBy($sortField, $sortMethod)->skip(0)
                        ->take($request['perPage'])
                        ->get();
                } else {
                    $filesInfos = File::where($condition_array)
                        ->orderBy($sortField, $sortMethod)
                        ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                        ->take($request['perPage'])
                        ->get();
                }

                // custom return
                return response()->json(
                    [
                        'data' => $filesInfos,
                        'system_files' => File::where("sku_user", "*")->get()->toArray(),
                        "totalData" => count(File::where($condition_array)->get()),
                        'message' => "Liste des elements",
                        'code' => 200
                    ]
                );
            } else {
                // get all
                if ($user->role == "super-admin") {
                    $condition_array['sku_user'] = "*";
                } else {
                    $condition_array['sku_user'] = $user->sku_user;
                }
                return response()->json(
                    [
                        'data' => File::where($condition_array)->get()->toArray(),
                        'system_files' => File::where("sku_user", "*")->get(),
                        "totalData" => count(File::where($condition_array)->get()),
                        'message' => "Liste des elements",
                        'code' => 200
                    ]
                );
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

    public function store(Request $request)
    {

        try {
            // check if user exists and logged in
            if (!$user = auth()->user()) {
                throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            }
        } catch (HttpException $th) {
            throw $th;
        }

        try {

            // check if file name / account / value exists
            $fileExists = File::where(['name' => $request->name])->get();
            $data_return = [];
            if (count($fileExists) > 0) {
                // no existing parring
                return response()->json(
                    [
                        'message' => "Le fichier " . $request->type . ": " . $request->name . " existe dans le système",
                    ],
                    400
                );
            }

            $file = new File();
            $data = $request->all();

            if ($user->role == "super-admin") {
                $file->sku_user = "*";
            } else {
                return response()->json(
                    [
                        'message' => "Accès Réfusé, vous ne pouvez pas ajouter les fichiers.",
                    ],
                    500
                );
            }
            $file->size = ($request->file('file')->getSize() * 1024); // in kilobites

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $file->$key = json_encode($value);
                } else {
                    if ($key != "sku_file" && $value != "null") {
                        $file->$key = $value;
                    }
                }
            }

            $file->type = "PDF";
            $file->save();
            return response()->json(
                [
                    'message' => "Enregistrement fichier Effectué",
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

    public function download($id)
    {
        try {
            // check if user exists and logged in
            if (!$user = auth()->user()) {
                throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            }
        } catch (HttpException $th) {
            throw $th;
        }

        try {
            //check

            $utils = new FunctionCollection();
            $user_repport =  $utils->WalletBalance();

            if ($user_repport['can_download_files'] == true or $user->role == "super-admin") {

                $document = File::find($id);

                // $file_contents = base64_decode($document->file);

                $file = 'dpo'.$document->file;

    if(file_exists($file)){
        header('Content-Disposition: name="'.basename($file).'"');
        header('Content-Type:application/pdf');
        header ('Content-Length:'.filesize($file));
        readfile($file);
        exit;

    }
/*
                return response($file_contents)
                    ->header('Cache-Control', 'no-cache private')
                    ->header('Content-Description', 'File Transfer')
                    ->header('Content-Type', "application/pdf")
                    ->header('Content-length', strlen($file_contents))
                    ->header('Content-Disposition', 'attachment; filename=' . $document->name . ".pdf")
                    ->header('Content-Transfer-Encoding', 'binary'); */
            } else {
                // a une dette
                return response()->json(
                    [
                        'message' => "Accès au téléchargement réfusé.",
                        'code' => 404
                    ]
                );
            }
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des informations de l'element",
                    'code' => 500
                ]
            );
        }
    }

    public function filter_filename($name)
    {
        // remove illegal file system characters https://en.wikipedia.org/wiki/Filename#Reserved_characters_and_words
        $name = str_replace(array_merge(
            array_map('chr', range(0, 31)),
            array('<', '>', ':', '"', '/', '\\', '|', '?', '*')
        ), '', $name);
        // maximise filename length to 255 bytes http://serverfault.com/a/9548/44086
        $ext = pathinfo($name, PATHINFO_EXTENSION);
        $name = mb_strcut(pathinfo($name, PATHINFO_FILENAME), 0, 255 - ($ext ? strlen($ext) + 1 : 0), mb_detect_encoding($name)) . ($ext ? '.' . $ext : '');
        return $name;
    }

    public function show($id)
    {
        try {
            // check if user exists and logged in
            if (!$user = auth()->user()) {
                throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            }
        } catch (HttpException $th) {
            throw $th;
        }

        try {
            $fileInfos = File::find($id);
            // $full_destination_url = url($fileInfos["image"]);
            // append image full url //
            // $fileInfos['image_url'] = $full_destination_url;
            // $fileInfos['modules'] = '[{"sku_file_parent":null,"sku_module":"module-1663742309717","name":"A propos du logiciel","route":"get-start","icon":null}]';
            return response()->json(
                [
                    'data' => $fileInfos,
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



    public function update(Request $request)
    {
        try {
            // check if user exists and logged in
            if (!$user = auth()->user()) {
                throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            }
        } catch (HttpException $th) {
            throw $th;
        }

        try {
            $file = File::find($request->id);
            $data = $request->all();
            foreach ($data as $key => $value) {
                if ($key != "sku_file" && $key != "sku_file" && $key != "created_at" && $key != "updated_at" && $key != "id" && $value != "null") {
                    if (is_array($value)) {
                        // convert to json string
                        $file->$key = json_encode($value);
                    } else {
                        if ($key != "sku_file" && $value != "null") {
                            $file->$key = $value;
                        }
                    }
                }
            }

            $file->save();
            return response()->json(
                [
                    'message' => "Mise a jour fichier effectuée",
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

    public function destroy($id)
    {
        try {
            $file = File::find($id);
            $file->delete();
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
