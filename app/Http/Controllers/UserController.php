<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if ($request->wantsJson()) {
            $users = User::query()
                ->orderByDesc('id')
                ->when($request->search, function ($query, $search) {
                    $query->whereAny(['name', 'email'], 'like', '%' . $search . '%');
                })
                ->when($request->is_active, function ($query, $is_active) {
                    if ($is_active === 'all') {
                        return;
                    }
                    if ($is_active === 'active') {
                        $query->where('is_active', true);
                    }
                    if ($is_active === 'inactive') {
                        $query->where('is_active', false);
                    }
                })
                ->paginate(30);
            return response()->json($users);
        }

        return Inertia::render('Users/Index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'is_active' => 'required|boolean',
        ]);
        $validated['password'] = bcrypt('password');
        $user = User::create($validated);
        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'is_active' => 'required|boolean',
        ]);
        $user->update($validated);
        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->noContent();
    }
}
