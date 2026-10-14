import obd from "@/assets/adapter-obd.jpg";
import j1939 from "@/assets/adapter-j1939.jpg";
import marine from "@/assets/adapter-marine.jpg";
import aviation from "@/assets/adapter-aviation.jpg";
import type { AdapterKind } from "@/lib/catalog";

export const productImages: Record<AdapterKind, string> = { obd, j1939, marine, aviation };
