import Container from "@/components/dynamic/Container";
import Text from "@/components/dynamic/Text";
import Button from "@/components/dynamic/Button";
import Card from "@/components/dynamic/Card";
import Sidebar from "@/components/dynamic/Sidebar";
import Header from "@/components/dynamic/Header";
import Grid from "@/components/dynamic/Grid";
import List from "@/components/dynamic/List";

export function renderNode(node) {
  if (!node) return null;

  // Render children first
  const children = node.children?.map((child, i) => (
    <div key={i}>{renderNode(child)}</div>
  ));

  switch (node.type) {
    case "page":
      return <div className="min-h-screen bg-gray-50">{children}</div>;

    case "container":
      return <Container {...node.props}>{children}</Container>;

    case "text":
      return <Text {...node.props}>{node.text}</Text>;

    case "button":
      return <Button {...node.props}>{children}</Button>;

    case "card":
      return <Card {...node.props}>{children}</Card>;

    case "sidebar":
      return <Sidebar {...node.props}>{children}</Sidebar>;

    case "header":
      return <Header {...node.props}>{children}</Header>;

    case "grid":
      return <Grid {...node.props}>{children}</Grid>;

    case "list":
      return <List {...node.props}>{children}</List>;

    default:
      return null;
  }
}
