<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /** Paginated audit trail; filters: action, user_id, from, to. */
    public function index(Request $request)
    {
        $query = AuditLog::query()->with('user:id,name')->latest('created_at');

        if ($request->filled('action')) {
            $query->where('action', $request->query('action'));
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->query('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->query('to'));
        }

        $logs = $query->paginate($request->integer('per_page', 30));

        return response()->json([
            'data' => $logs->through(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description,
                'user' => $log->user?->name,
                'meta' => $log->meta,
                'created_at' => $log->created_at?->toIso8601String(),
            ])->items(),
            'meta' => [
                'total' => $logs->total(),
                'from' => $logs->firstItem(),
                'to' => $logs->lastItem(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }
}
