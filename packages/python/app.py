import os
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from grpc import ssl_channel_credentials

# resource describes app-level information that will be added to all spans
resource = Resource(attributes={
    "service.name": os.environ.get("SERVICE_NAME")
})

# create new trace provider with our resource
trace_provider = TracerProvider(resource=resource)

# create exporter to send spans to Honeycomb
otlp_exporter = OTLPSpanExporter(
    endpoint="api.honeycomb.io:443",
    insecure=False,
    credentials=ssl_channel_credentials(),
    headers=(
        ("x-honeycomb-team", os.environ.get("HONEYCOMB_API_KEY")),
        ("x-honeycomb-dataset", os.environ.get("HONEYCOMB_DATASET"))
    )
)

# register exporter with provider
trace_provider.add_span_processor(
    BatchSpanProcessor(otlp_exporter)
)

# register trace provider
trace.set_tracer_provider(trace_provider)