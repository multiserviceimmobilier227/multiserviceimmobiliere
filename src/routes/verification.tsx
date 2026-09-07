import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { verifyDocumentNumber } from "@/lib/documents.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MsiLogo } from "@/components/ui/msi-logo";
import { BadgeCheck, ShieldAlert, ShieldX, Loader2 } from "lucide-react";

export const Route = createFileRoute("/verification")({
  component: VerificationPage,
  head: () => ({
    meta: [
      { title: "Vérifier un document officiel | Multi Services Immobilière" },
      {
        name: "description",
        content:
          "Vérifiez l'authenticité d'un reçu, contrat ou attestation émis par Multi Services Immobilière à Maradi.",
      },
      { property: "og:title", content: "Vérifier un document officiel MSI" },
      {
        property: "og:description",
        content: "Contrôle en ligne de l'authenticité des documents Multi Services Immobilière.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Result = Awaited<ReturnType<typeof verifyDocumentNumber>>;

function VerificationPage() {
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const [docNumber, setDocNumber] = useState(search?.get("n") ?? "");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verify = useServerFn(verifyDocumentNumber);

  const handleVerify = async () => {
    if (docNumber.trim().length < 6) {
      setError("Saisissez un numéro de document complet.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await verify({ data: { docNumber: docNumber.trim() } }));
    } catch {
      setError("Vérification momentanément indisponible. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <MsiLogo className="h-14" />
          <h1 className="text-xl font-semibold tracking-tight">Vérification d'un document officiel</h1>
          <p className="text-sm text-muted-foreground">
            Saisissez le numéro figurant sur le document ou scannez son QR code.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Numéro du document</CardTitle>
            <CardDescription>Format : MSI/AGENCE/TYPE/ANNÉE/00000</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input
              value={docNumber}
              onChange={(event) => setDocNumber(event.target.value)}
              placeholder="MSI/MAR/RECU/2026/00001"
              inputMode="text"
              autoCapitalize="characters"
            />
            <Button onClick={handleVerify} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Vérifier
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>

        {result ? (
          <Card
            className={
              !result.found
                ? "border-destructive/40"
                : result.status === "emis"
                  ? "border-primary/50"
                  : "border-amber-500/50"
            }
          >
            <CardContent className="flex flex-col gap-3 pt-6">
              {!result.found ? (
                <div className="flex items-start gap-3">
                  <ShieldX className="mt-0.5 h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-semibold">Document inconnu</p>
                    <p className="text-sm text-muted-foreground">
                      Aucun document officiel ne correspond à ce numéro.
                    </p>
                  </div>
                </div>
              ) : result.status === "emis" ? (
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Document authentique</p>
                    <p className="text-sm text-muted-foreground">
                      {result.docLabel} émis le {result.issuedOn}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-semibold">
                      Document {result.status === "annule" ? "annulé" : "remplacé"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {result.docLabel} émis le {result.issuedOn}. Ce document n'est plus valable.
                    </p>
                  </div>
                </div>
              )}
              <p className="font-mono text-xs text-muted-foreground">{result.docNumber}</p>
            </CardContent>
          </Card>
        ) : null}

        <p className="text-center text-xs text-muted-foreground">
          Multi Services Immobilière — Maradi, Niger
        </p>
      </div>
    </main>
  );
}
