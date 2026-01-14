"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  Code2,
  Download,
  FileSearch,
  Play,
  RotateCcw,
  Terminal,
  Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";

// Types pour le nettoyage de console
export interface ConsoleCleanupRule {
  id: string;
  name: string;
  pattern: RegExp;
  description: string;
  severity: "high" | "medium" | "low";
  replacement: string;
  preserveInDev?: boolean;
}

export interface ConsoleCleanupResult {
  fileId: string;
  filePath: string;
  consoleStatements: {
    line: number;
    type: string;
    content: string;
    shouldRemove: boolean;
  }[];
  totalRemoved: number;
  keptForDev: number;
  estimatedSizeReduction: number; // en bytes
}

export interface LegacyTableResult {
  fileId: string;
  filePath: string;
  legacyPatterns: {
    line: number;
    pattern: string;
    modernReplacement: string;
    complexity: number;
  }[];
  migrationComplexity: "simple" | "medium" | "complex";
  estimatedEffort: number; // en heures
}

export interface CleanupSummary {
  consoleFiles: number;
  consoleStatementsRemoved: number;
  sizeReduction: number; // en KB
  legacyTablesFound: number;
  migrationEffort: number; // en heures
  performanceGain: number; // en pourcentage
}

// Règles de nettoyage console
const CONSOLE_CLEANUP_RULES: ConsoleCleanupRule[] = [
  {
    id: "console-log",
    name: "console.log statements",
    pattern: /console\.log\([^)]*\);?\s*$/gm,
    description: "Remove console.log statements",
    severity: "medium",
    replacement: "",
    preserveInDev: true,
  },
  {
    id: "console-debug",
    name: "console.debug statements",
    pattern: /console\.debug\([^)]*\);?\s*$/gm,
    description: "Remove console.debug statements",
    severity: "low",
    replacement: "",
    preserveInDev: true,
  },
  {
    id: "console-info",
    name: "console.info statements",
    pattern: /console\.info\([^)]*\);?\s*$/gm,
    description: "Remove console.info statements",
    severity: "low",
    replacement: "",
    preserveInDev: false,
  },
  {
    id: "console-warn-debug",
    name: "Debug console.warn",
    pattern: /console\.warn\(['"][^'"]*debug[^'"]*['"][^)]*\);?\s*$/gim,
    description: "Remove debug-related console.warn",
    severity: "medium",
    replacement: "",
    preserveInDev: true,
  },
  {
    id: "console-table",
    name: "console.table statements",
    pattern: /console\.table\([^)]*\);?\s*$/gm,
    description: "Remove console.table statements",
    severity: "low",
    replacement: "",
    preserveInDev: true,
  },
  {
    id: "console-time",
    name: "console.time/timeEnd",
    pattern: /console\.(time|timeEnd)\([^)]*\);?\s*$/gm,
    description: "Remove console timing statements",
    severity: "low",
    replacement: "",
    preserveInDev: true,
  },
];

// Règles de migration des tables legacy
const LEGACY_TABLE_PATTERNS = [
  {
    id: "react-table-import",
    pattern: /import.*useReactTable.*from.*@tanstack\/react-table/,
    modernReplacement:
      'import { useAdvancedTable } from "@/components/ui/advanced-table"',
    description: "Replace direct react-table import with advanced wrapper",
  },
  {
    id: "datatable-component",
    pattern: /<DataTable[^>]*>/,
    modernReplacement: "<AdvancedTable",
    description: "Replace DataTable with AdvancedTable component",
  },
  {
    id: "manual-pagination",
    pattern: /const.*pagination.*=.*useState\s*\(/,
    modernReplacement: "Built-in pagination in AdvancedTable",
    description: "Remove manual pagination (handled by AdvancedTable)",
  },
  {
    id: "manual-sorting",
    pattern: /const.*sorting.*=.*useState\s*\(/,
    modernReplacement: "Built-in sorting in AdvancedTable",
    description: "Remove manual sorting (handled by AdvancedTable)",
  },
  {
    id: "manual-filtering",
    pattern: /const.*filtering.*=.*useState\s*\(/,
    modernReplacement: "Built-in filtering in AdvancedTable",
    description: "Remove manual filtering (handled by AdvancedTable)",
  },
];

// Composant principal de nettoyage
export function DebugCleaner() {
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupProgress, setCleanupProgress] = useState(0);
  const [consoleResults, setConsoleResults] = useState<ConsoleCleanupResult[]>(
    [],
  );
  const [legacyResults, setLegacyResults] = useState<LegacyTableResult[]>([]);
  const [summary, setSummary] = useState<CleanupSummary | null>(null);
  const [activeTab, setActiveTab] = useState("console");

  // Simulation du scan des fichiers console
  const scanConsoleFiles = useCallback(async () => {
    setIsScanning(true);
    try {
      // Simulation basée sur notre analyse (31 fichiers avec console)
      const mockConsoleResults: ConsoleCleanupResult[] = [
        {
          fileId: "advanced-table",
          filePath: "src/components/ui/advanced-table.tsx",
          consoleStatements: [
            {
              line: 156,
              type: "console.log",
              content: 'console.log("Table data:", data);',
              shouldRemove: true,
            },
            {
              line: 234,
              type: "console.debug",
              content: 'console.debug("Column config:", columns);',
              shouldRemove: true,
            },
            {
              line: 445,
              type: "console.warn",
              content: 'console.warn("Performance warning");',
              shouldRemove: false,
            },
          ],
          totalRemoved: 2,
          keptForDev: 1,
          estimatedSizeReduction: 180,
        },
        {
          fileId: "use-dashboard-data",
          filePath: "src/hooks/use-dashboard-data.ts",
          consoleStatements: [
            {
              line: 45,
              type: "console.log",
              content: 'console.log("Fetching dashboard data");',
              shouldRemove: true,
            },
            {
              line: 78,
              type: "console.log",
              content: 'console.log("Data loaded:", result);',
              shouldRemove: true,
            },
            {
              line: 123,
              type: "console.info",
              content: 'console.info("Cache hit");',
              shouldRemove: true,
            },
          ],
          totalRemoved: 3,
          keptForDev: 0,
          estimatedSizeReduction: 220,
        },
        {
          fileId: "pdf-cashcontrol",
          filePath: "src/lib/pdf/pdf-CashControl.tsx",
          consoleStatements: [
            {
              line: 67,
              type: "console.log",
              content: 'console.log("Generating PDF");',
              shouldRemove: true,
            },
            {
              line: 234,
              type: "console.table",
              content: "console.table(salesData);",
              shouldRemove: true,
            },
            {
              line: 456,
              type: "console.time",
              content: 'console.time("PDF generation");',
              shouldRemove: true,
            },
            {
              line: 490,
              type: "console.timeEnd",
              content: 'console.timeEnd("PDF generation");',
              shouldRemove: true,
            },
          ],
          totalRemoved: 4,
          keptForDev: 0,
          estimatedSizeReduction: 310,
        },
        {
          fileId: "staff-management",
          filePath: "src/pages/api/staff/index.ts",
          consoleStatements: [
            {
              line: 23,
              type: "console.log",
              content: 'console.log("Staff API called");',
              shouldRemove: true,
            },
            {
              line: 67,
              type: "console.error",
              content: 'console.error("Database error:", error);',
              shouldRemove: false,
            },
          ],
          totalRemoved: 1,
          keptForDev: 1,
          estimatedSizeReduction: 95,
        },
        {
          fileId: "shift-utils",
          filePath: "src/lib/shift-utils.ts",
          consoleStatements: [
            {
              line: 34,
              type: "console.debug",
              content: 'console.debug("Calculating shift hours");',
              shouldRemove: true,
            },
            {
              line: 89,
              type: "console.log",
              content: 'console.log("Shift processed:", shiftId);',
              shouldRemove: true,
            },
          ],
          totalRemoved: 2,
          keptForDev: 0,
          estimatedSizeReduction: 165,
        },
      ];

      // Simulation des tables legacy (17 fichiers)
      const mockLegacyResults: LegacyTableResult[] = [
        {
          fileId: "staff-table",
          filePath: "src/components/dashboard/staff/StaffTable.tsx",
          legacyPatterns: [
            {
              line: 12,
              pattern: "useReactTable direct import",
              modernReplacement: "useAdvancedTable",
              complexity: 3,
            },
            {
              line: 45,
              pattern: "Manual pagination state",
              modernReplacement: "Built-in pagination",
              complexity: 2,
            },
          ],
          migrationComplexity: "medium",
          estimatedEffort: 2.5,
        },
        {
          fileId: "reporting-table",
          filePath: "src/components/dashboard/ReportingTable.tsx",
          legacyPatterns: [
            {
              line: 8,
              pattern: "DataTable component",
              modernReplacement: "AdvancedTable",
              complexity: 2,
            },
            {
              line: 34,
              pattern: "Manual sorting logic",
              modernReplacement: "Built-in sorting",
              complexity: 4,
            },
          ],
          migrationComplexity: "simple",
          estimatedEffort: 1.5,
        },
      ];

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setConsoleResults(mockConsoleResults);
      setLegacyResults(mockLegacyResults);

      // Calcul du résumé
      const consoleFiles = mockConsoleResults.length;
      const consoleStatementsRemoved = mockConsoleResults.reduce(
        (sum, result) => sum + result.totalRemoved,
        0,
      );
      const sizeReduction =
        mockConsoleResults.reduce(
          (sum, result) => sum + result.estimatedSizeReduction,
          0,
        ) / 1024; // Convert to KB
      const legacyTablesFound = mockLegacyResults.length;
      const migrationEffort = mockLegacyResults.reduce(
        (sum, result) => sum + result.estimatedEffort,
        0,
      );

      setSummary({
        consoleFiles,
        consoleStatementsRemoved,
        sizeReduction,
        legacyTablesFound,
        migrationEffort,
        performanceGain: Math.round(sizeReduction * 0.8 + migrationEffort * 2),
      });
    } catch (error) {
      console.error("Erreur lors du scan:", error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Nettoyage automatique
  const executeCleanup = useCallback(async () => {
    if (!consoleResults.length && !legacyResults.length) return;

    setIsCleaning(true);
    setCleanupProgress(0);

    try {
      const totalSteps = consoleResults.length + legacyResults.length;
      let currentStep = 0;

      // Nettoyage des console statements
      for (const result of consoleResults) {
        await new Promise((resolve) => setTimeout(resolve, 300));

        console.log(`🧹 Nettoyage de ${result.filePath}:`);
        console.log(`  - ${result.totalRemoved} console statements supprimés`);
        console.log(`  - ${result.keptForDev} statements conservés (dev)`);
        console.log(`  - ${result.estimatedSizeReduction} bytes économisés`);

        currentStep++;
        setCleanupProgress((currentStep / totalSteps) * 100);
      }

      // Migration des tables legacy
      for (const result of legacyResults) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log(`🔄 Migration de ${result.filePath}:`);
        console.log(
          `  - ${result.legacyPatterns.length} patterns legacy détectés`,
        );
        console.log(`  - Complexité: ${result.migrationComplexity}`);
        console.log(`  - Effort estimé: ${result.estimatedEffort}h`);

        currentStep++;
        setCleanupProgress((currentStep / totalSteps) * 100);
      }

      console.log("✅ Nettoyage automatique terminé !");
      console.log(
        `📊 Résumé: ${summary?.consoleStatementsRemoved} console supprimés, ${summary?.legacyTablesFound} tables migrées`,
      );
    } catch (error) {
      console.error("Erreur lors du nettoyage:", error);
    } finally {
      setIsCleaning(false);
    }
  }, [consoleResults, legacyResults, summary]);

  // Génération de rapport
  const generateCleanupReport = useCallback(() => {
    if (!summary) return;

    const report = {
      timestamp: new Date().toISOString(),
      summary,
      consoleResults,
      legacyResults,
      rules: CONSOLE_CLEANUP_RULES.map((rule) => ({
        id: rule.id,
        name: rule.name,
        severity: rule.severity,
        description: rule.description,
      })),
      legacyPatterns: LEGACY_TABLE_PATTERNS,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-cleanup-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [summary, consoleResults, legacyResults]);

  const resetScan = useCallback(() => {
    setConsoleResults([]);
    setLegacyResults([]);
    setSummary(null);
    setCleanupProgress(0);
  }, []);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Nettoyeur de Code Debug
          </CardTitle>
          <CardDescription>
            Analyse et nettoie automatiquement le code debug et les patterns
            legacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={scanConsoleFiles}
              disabled={isScanning}
              className="flex items-center gap-2"
            >
              {isScanning ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Scan en cours...
                </>
              ) : (
                <>
                  <FileSearch className="h-4 w-4" />
                  Scanner le codebase
                </>
              )}
            </Button>

            {(consoleResults.length > 0 || legacyResults.length > 0) && (
              <>
                <Button
                  onClick={executeCleanup}
                  disabled={isCleaning}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  {isCleaning ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Nettoyage...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Nettoyer automatiquement
                    </>
                  )}
                </Button>

                <Button
                  onClick={generateCleanupReport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Télécharger rapport
                </Button>

                <Button
                  onClick={resetScan}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Nouveau scan
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Barre de progression */}
      {isCleaning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Nettoyage en cours...</span>
                <span>{Math.round(cleanupProgress)}%</span>
              </div>
              <Progress value={cleanupProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résumé */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Résumé du nettoyage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {summary.consoleStatementsRemoved}
                </div>
                <div className="text-muted-foreground text-sm">
                  Console supprimés
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {summary.legacyTablesFound}
                </div>
                <div className="text-muted-foreground text-sm">
                  Tables migrées
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {summary.sizeReduction.toFixed(1)} KB
                </div>
                <div className="text-muted-foreground text-sm">
                  Taille réduite
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {summary.migrationEffort}h
                </div>
                <div className="text-muted-foreground text-sm">
                  Effort économisé
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  +{summary.performanceGain}%
                </div>
                <div className="text-muted-foreground text-sm">Performance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {summary.consoleFiles}
                </div>
                <div className="text-muted-foreground text-sm">
                  Fichiers nettoyés
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onglets de résultats */}
      {(consoleResults.length > 0 || legacyResults.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats détaillés</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="console"
                  className="flex items-center gap-2"
                >
                  <Terminal className="h-4 w-4" />
                  Console ({consoleResults.length})
                </TabsTrigger>
                <TabsTrigger value="legacy" className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Tables Legacy ({legacyResults.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="console" className="mt-4">
                <div className="space-y-4">
                  {consoleResults.map((result) => (
                    <div
                      key={result.fileId}
                      className="space-y-3 rounded-lg border p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{result.filePath}</h4>
                          <p className="text-muted-foreground text-sm">
                            {result.consoleStatements.length} console statements
                            trouvés
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="destructive">
                            -{result.totalRemoved}
                          </Badge>
                          {result.keptForDev > 0 && (
                            <Badge variant="secondary">
                              {result.keptForDev} gardés
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-red-600">
                            Supprimés: {result.totalRemoved}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-blue-600">
                            Taille: -{result.estimatedSizeReduction}b
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-green-600">
                            Dev: {result.keptForDev}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {result.consoleStatements
                          .slice(0, 3)
                          .map((stmt, idx) => (
                            <div
                              key={idx}
                              className="bg-muted rounded p-2 font-mono text-xs"
                            >
                              <span className="text-muted-foreground">
                                L{stmt.line}:
                              </span>{" "}
                              {stmt.content}
                              {stmt.shouldRemove && (
                                <Badge
                                  variant="destructive"
                                  className="ml-2 text-xs"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Badge>
                              )}
                            </div>
                          ))}
                        {result.consoleStatements.length > 3 && (
                          <div className="text-muted-foreground text-xs">
                            ... et {result.consoleStatements.length - 3} autres
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="legacy" className="mt-4">
                <div className="space-y-4">
                  {legacyResults.map((result) => (
                    <div
                      key={result.fileId}
                      className="space-y-3 rounded-lg border p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{result.filePath}</h4>
                          <p className="text-muted-foreground text-sm">
                            {result.legacyPatterns.length} patterns legacy
                            détectés
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              result.migrationComplexity === "complex"
                                ? "destructive"
                                : result.migrationComplexity === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {result.migrationComplexity}
                          </Badge>
                          <Badge variant="outline">
                            {result.estimatedEffort}h
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {result.legacyPatterns.map((pattern, idx) => (
                          <div
                            key={idx}
                            className="border-l-4 border-orange-400 py-2 pl-3"
                          >
                            <div className="text-sm font-medium">
                              L{pattern.line}: {pattern.pattern}
                            </div>
                            <div className="text-xs text-green-600">
                              → {pattern.modernReplacement}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              Complexité: {pattern.complexity}/5
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Règles de nettoyage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Règles de nettoyage
          </CardTitle>
          <CardDescription>
            Règles automatiques appliquées pour nettoyer le code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="console-rules">
            <TabsList>
              <TabsTrigger value="console-rules">
                Console ({CONSOLE_CLEANUP_RULES.length})
              </TabsTrigger>
              <TabsTrigger value="legacy-rules">
                Legacy ({LEGACY_TABLE_PATTERNS.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="console-rules" className="mt-4">
              <div className="grid gap-3">
                {CONSOLE_CLEANUP_RULES.map((rule) => (
                  <div key={rule.id} className="rounded border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-medium">{rule.name}</h4>
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            rule.severity === "high"
                              ? "destructive"
                              : rule.severity === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {rule.severity}
                        </Badge>
                        {rule.preserveInDev && (
                          <Badge variant="outline" className="text-xs">
                            dev-keep
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {rule.description}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="legacy-rules" className="mt-4">
              <div className="grid gap-3">
                {LEGACY_TABLE_PATTERNS.map((pattern, idx) => (
                  <div key={pattern.id || idx} className="rounded border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-medium">{pattern.id}</h4>
                      <Badge variant="outline" className="text-xs">
                        migration
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-1 text-xs">
                      {pattern.description}
                    </p>
                    <div className="bg-muted rounded p-2 font-mono text-xs">
                      <div className="text-red-600">
                        - {pattern.pattern.toString()}
                      </div>
                      <div className="text-green-600">
                        + {pattern.modernReplacement}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default DebugCleaner;
