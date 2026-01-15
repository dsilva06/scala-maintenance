<?php

namespace Tests\Feature;

use Tests\TestCase;

class OpenApiContractTest extends TestCase
{
    public function test_openapi_spec_contains_core_paths(): void
    {
        $specPath = base_path('docs/openapi.yaml');
        if (!file_exists($specPath)) {
            $specPath = base_path('../docs/openapi.yaml');
        }

        $spec = file_get_contents($specPath);

        $this->assertNotFalse($spec);
        $this->assertStringContainsString('/vehicles:', $spec);
        $this->assertStringContainsString('/trips:', $spec);
        $this->assertStringContainsString('/telemetry/ingest:', $spec);
        $this->assertStringContainsString('/telemetry/stream:', $spec);
        $this->assertStringContainsString('/analytics/events:', $spec);
        $this->assertStringContainsString('/analytics/events/summary:', $spec);
        $this->assertStringContainsString('/analytics/metrics:', $spec);
    }

    public function test_openapi_spec_declares_versioned_server(): void
    {
        $specPath = base_path('docs/openapi.yaml');
        if (!file_exists($specPath)) {
            $specPath = base_path('../docs/openapi.yaml');
        }

        $spec = file_get_contents($specPath);

        $this->assertNotFalse($spec);
        $this->assertStringContainsString('/api/v1', $spec);
    }
}
