import { renderNode } from "@/agent/generator/dynamicRenderer";
import spec from "../../agent/specs/home.json";

export default function HomePage() {
  return renderNode(spec);
}
