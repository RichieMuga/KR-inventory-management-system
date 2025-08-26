"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/loading/loading";

import {
  Package,
  CheckCircle,
  Users,
  AlertTriangle,
  Layers,
} from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

// ✅ Fetch Bulk Assets Data
async function fetchDashboardBulkAssetsData() {
  const response = await axios.get("/api/dashboard/bulk");
  return response.data;
}

// ✅ Fetch Unique Assets Data
async function fetchDashboardUniqueAssetsData() {
  const response = await axios.get("/api/dashboard/unique");
  return response.data;
}

// ✅ Fetch Activity Data (Recent Movements + Top Keepers)
async function fetchDashboardActivityData() {
  const response = await axios.get("/api/dashboard/activity");
  return response.data;
}

export default function DashboardPage() {
  // 🔹 Query 1: Bulk Assets
  const {
    isPending: isBulkPending,
    error: bulkError,
    data: bulkData,
  } = useQuery({
    queryKey: ["dashboard-bulk"],
    queryFn: fetchDashboardBulkAssetsData,
  });

  // 🔹 Query 2: Unique Assets
  const {
    isPending: isUniquePending,
    error: uniqueError,
    data: uniqueData,
  } = useQuery({
    queryKey: ["dashboard-unique"],
    queryFn: fetchDashboardUniqueAssetsData,
  });

  // 🔹 Query 3: Activity Data (Recent Movements & Top Keepers)
  const {
    isPending: isActivityPending,
    error: activityError,
    data: activityData,
  } = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: fetchDashboardActivityData,
  });

  // 🔁 Loading state
  if (isBulkPending || isUniquePending || isActivityPending)
    return (
      <div className="p-6">
        <Loading />
      </div>
    );

  // 🔴 Error handling
  if (bulkError)
    return <div className="p-6 text-red-500">Error loading bulk data</div>;
  if (uniqueError)
    return <div className="p-6 text-red-500">Error loading unique assets</div>;
  if (activityError)
    return <div className="p-6 text-red-500">Error loading activity data</div>;

  // ✅ Build ICT Keeper stats using real API data
  const ictKeeperStats = [
    {
      title: "Unique Assets Tracked",
      value: uniqueData?.totalUnique ?? 0,
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      description: "Serialized ICT assets tracked individually",
    },
    {
      title: "Available Unique Assets",
      value: uniqueData?.availableUnique ?? 0,
      icon: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
      description: "Unassigned and ready for use",
    },
    {
      title: "Assigned Unique Assets",
      value: uniqueData?.assignedUnique ?? 0,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "Currently in use by staff",
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <h1 className="text-3xl font-bold text-kr-maroon-dark">
          Store Keeping & Asset Tracking Dashboard
        </h1>

        {/* BULK ASSETS STATS */}
        <section>
          <h2 className="text-xl font-semibold mb-2">
            Store Keeper Overview (Bulk Items)
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* CARD 1: Bulk Assets in Store */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Bulk Assets in Store
                </CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bulkData?.totalBulk ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total quantity of bulk items (e.g. toners, cables)
                </p>
              </CardContent>
            </Card>

            {/* CARD 2: Low Stock Alerts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Stock Alerts
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bulkData?.lowStockCount ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Number of bulk items below minimum stock level
                </p>
              </CardContent>
            </Card>
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

        {/* RECENT MOVEMENTS + TOP KEEPERS */}
        <section className="grid gap-4 md:grid-cols-2 mt-8">
          {/* Recent Movements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Movements</CardTitle>
            </CardHeader>
            <CardContent>
              {activityData?.recentMovements &&
              activityData.recentMovements.length > 0 ? (
                <ul className="text-sm text-muted-foreground space-y-2">
                  {activityData.recentMovements.map((movement: any) => (
                    <li key={movement.movementId} className="leading-tight">
                      <span className="font-medium">{movement.asset.name}</span>{" "}
                      <span className="capitalize">
                        {movement.movementType === "assignment"
                          ? "assigned"
                          : movement.movementType === "transfer"
                            ? "transferred"
                            : movement.movementType === "adjustment"
                              ? "adjusted"
                              : movement.movementType}
                      </span>{" "}
                      {movement.toLocation && (
                        <>
                          to{" "}
                          <span className="font-medium">
                            {movement.toLocation.departmentName}
                          </span>
                        </>
                      )}
                      <span className="text-xs text-gray-500 ml-1">
                        ({new Date(movement.timestamp).toLocaleDateString()})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No recent movements.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Asset Keepers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Asset Keepers</CardTitle>
            </CardHeader>
            <CardContent>
              {activityData?.topKeepers &&
              activityData.topKeepers.length > 0 ? (
                <ul className="text-sm text-muted-foreground space-y-2">
                  {activityData.topKeepers.map((keeper: any) => (
                    <li
                      key={keeper.payrollNumber}
                      className="flex justify-between"
                    >
                      <span>
                        {keeper.firstName} {keeper.lastName}
                      </span>
                      <span className="font-medium text-gray-700">
                        {keeper.assetCount} asset(s)
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No keepers found.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
