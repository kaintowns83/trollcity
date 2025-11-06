import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function PaymentVerificationSection({ userId }) {
  const queryClient = useQueryClient();

  const { data: verifications = [] } = useQuery({
    queryKey: ['paymentVerifications', userId],
    queryFn: () => base44.entities.PaymentVerification.filter({ user_id: userId }, "-created_date"),
    enabled: !!userId,
    initialData: [],
  });

  const latestVerification = verifications[0];

  const verifyPaymentMutation = useMutation({
    mutationFn: async (verificationId) => {
      await base44.entities.PaymentVerification.update(verificationId, {
        verified_by_user: true,
        verified_date: new Date().toISOString(),
        verification_required: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['paymentVerifications']);
      toast.success("✅ Payment method verified! You can now request payouts.");
    }
  });

  if (!latestVerification) return null;

  return (
    <div className="mt-6">
      <h4 className="text-white font-bold mb-3 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-400" />
        Payment Verification
      </h4>

      {latestVerification.test_payment_sent && !latestVerification.verified_by_user ? (
        <Card className="bg-yellow-500/10 border border-yellow-500/30 p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-white font-bold mb-2">⏳ Verification Required</h4>
              <p className="text-yellow-300 text-sm mb-3">
                We've sent a <strong>$0.00 test payment</strong> to your {latestVerification.payment_method} account to verify it works.
              </p>
              <p className="text-yellow-200 text-sm mb-4">
                Check your {latestVerification.payment_method} account for the test transaction and confirm below.
              </p>
              <Button
                onClick={() => verifyPaymentMutation.mutate(latestVerification.id)}
                disabled={verifyPaymentMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {verifyPaymentMutation.isPending ? "Verifying..." : "✅ I Received the $0.00 Test Payment"}
              </Button>
            </div>
          </div>
        </Card>
      ) : latestVerification.verified_by_user ? (
        <Card className="bg-green-500/10 border border-green-500/30 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-green-300 font-bold">✅ Payment Method Verified</p>
              <p className="text-green-200 text-sm">
                Verified on {new Date(latestVerification.verified_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="bg-blue-500/10 border border-blue-500/30 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-blue-300 text-sm">
                💳 Test payment will be sent by admin. You'll receive a notification when it's sent.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}