<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #111827; }
        h1 { font-size: 18px; margin: 0 0 2px; }
        .meta { color: #6b7280; font-size: 10px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f7f8fa; text-align: left; padding: 6px 8px; border-bottom: 2px solid #e2e6ec; }
        td { padding: 6px 8px; border-bottom: 1px solid #e2e6ec; }
        .summary { margin-top: 16px; }
        .summary div { margin-bottom: 2px; }
        .summary span { font-weight: bold; }
    </style>
</head>
<body>
    <h1>{{ $title }}</h1>
    <div class="meta">
        {{ config('app.name') }}
        @if($from || $to) · {{ $from ?? '…' }} to {{ $to ?? '…' }} @endif
        · generated {{ now()->toDayDateTimeString() }}
    </div>

    <table>
        <thead>
            <tr>
                @foreach($columns as $col)
                    <th>{{ $col }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
                <tr>
                    @foreach($row as $cell)
                        <td>{{ $cell }}</td>
                    @endforeach
                </tr>
            @empty
                <tr><td colspan="{{ count($columns) }}">No records.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary">
        @foreach($summary as $label => $value)
            <div>{{ $label }}: <span>{{ $value }}</span></div>
        @endforeach
    </div>
</body>
</html>
