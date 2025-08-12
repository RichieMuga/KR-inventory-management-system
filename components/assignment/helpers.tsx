import { Badge } from "@/components/ui/badge";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "In use":
      return (
        <Badge className="text-gray-600 border-gray-300 bg-white">In use</Badge>
      );
    case "Returned":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">Returned</Badge>
      );
    case "Not in use":
      return (
        <Badge className="bg-gray-500 hover:bg-gray-600">Not in use</Badge>
      );
    default:
      return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>;
  }
};
