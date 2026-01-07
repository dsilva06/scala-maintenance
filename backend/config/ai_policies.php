<?php

return [
    'thresholds' => [
        'service_due_days' => 30,
        'document_expiration_days' => 30,
    ],
    'rules' => [
        [
            'id' => 'stock_below_min',
            'description' => 'Si stock <= minimo, proponer compra y pedir confirmacion. No ejecutar automaticamente.',
        ],
        [
            'id' => 'high_priority_alert',
            'description' => 'Si una orden tiene prioridad alta o critica, crear alerta inmediata.',
        ],
        [
            'id' => 'overdue_escalation',
            'description' => 'Si una orden esta vencida, escalar prioridad a alta.',
        ],
        [
            'id' => 'document_expiring',
            'description' => 'Si un documento vence en <= 30 dias, crear alerta.',
        ],
        [
            'id' => 'service_due',
            'description' => 'Si un vehiculo tiene servicio en <= 30 dias, proponer mantenimiento preventivo.',
        ],
    ],
];
