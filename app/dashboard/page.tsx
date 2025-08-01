import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle, Users, Wrench } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Assets",
      value: "1500",
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      description: "Total ICT items in inventory",
    },
    {
      title: "Assets Available",
      value: "1200",
      icon: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
      description: "Ready for assignment or use",
    },
    {
      title: "Assets Assigned",
      value: "250",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "Currently in use by staff",
    },
    {
      title: "Assets In Repair",
      value: "50",
      icon: <Wrench className="h-4 w-4 text-muted-foreground" />,
      description: "Undergoing maintenance or repair",
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <h1 className="text-3xl font-bold text-kr-maroon-dark">
          Dashboard Overview
        </h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground">
                <li>
                  - Toner Cartridge moved from IT Store A to Office 101
                  (2024-07-30)
                </li>
                <li>- Laptop assigned to Jane Doe (2024-07-29)</li>
                <li>- Projector returned from Training Room (2024-07-28)</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-red-600">
                <li>- HP Toner Cartridge (Black) - 5 left</li>
                <li>- Network Cable (CAT6) - 12 left</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
