<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    /** All settings as a key => value map (readable by any authenticated user). */
    public function index()
    {
        return response()->json(Setting::pluck('value', 'key'));
    }

    /** Bulk upsert settings (Super Admin only). */
    public function update(Request $request)
    {
        $data = $request->validate([
            'settings' => ['required', 'array'],
        ]);

        foreach ($data['settings'] as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return response()->json(Setting::pluck('value', 'key'));
    }

    /** Upload a business logo and store its public URL in settings. */
    public function logo(Request $request)
    {
        $request->validate([
            'logo' => ['required', 'image', 'max:2048'],
        ]);

        $path = $request->file('logo')->store('logos', 'public');
        $url = Storage::url($path);

        Setting::updateOrCreate(['key' => 'business_logo'], ['value' => $url]);

        return response()->json(['business_logo' => $url]);
    }
}
