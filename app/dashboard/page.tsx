"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  CheckCircle,
  Users,
  AlertTriangle,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const storeKeeperStats = [
    {
      title: "Bulk Assets in Store",
      value: "430",
      icon: <Layers className="h-4 w-4 text-muted-foreground" />,
      description: "Total quantity of bulk items (e.g. toners, cables)",
    },
    {
      title: "Low Stock Alerts (Bulk)",
      value: "3",
      icon: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
      description: "Items below reorder threshold",
    },
  ];

  const ictKeeperStats = [
    {
      title: "Unique Assets Tracked",
      value: "1070",
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      description: "Serialized ICT assets tracked individually",
    },
    {
      title: "Available Unique Assets",
      value: "820",
      icon: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
      description: "Unassigned and ready for use",
    },
    {
      title: "Assigned Unique Assets",
      value: "250",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "Currently in use by staff",
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <h1 className="text-3xl font-bold text-kr-maroon-dark">
          Store Keeping &amp; Asset tracking Dashboard
        </h1>

        {/* STORE KEEPER STATS */}
        <section>
          <h2 className="text-xl font-semibold mb-2">
            Store Keeper Overview (Bulk Items)
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {storeKeeperStats.map((stat, index) => (
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
        </section>

        {/* ICT KEEPER STATS */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-2">
            ICT Keeper Overview (Unique Assets)
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {ictKeeperStats.map((stat, index) => (
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
        </section>

        {/* RECENT MOVEMENTS + LOW STOCK */}
        <section className="grid gap-4 md:grid-cols-2 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
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
              <CardTitle>Top Asset Keepers</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- John Mwangi – 80 assets</li>
                <li>- Alice Wanjiru – 65 assets</li>
                <li>- Brian Otieno – 50 assets</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
