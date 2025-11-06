
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Coins, Send, CheckCircle, XCircle, Clock, CreditCard, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function RequestCoinsPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [paymentPrice, setPaymentPrice] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myRequests } = useQuery({
    queryKey: ['myRequests', user?.id],
    queryFn: () => base44.entities.CoinRequest.filter({ user_id: user.id }, "-created_date"),
    initialData: [],
    enabled: !!user?.id,
  });

  // Get coins and price from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const coins = urlParams.get('coins');
    const price = urlParams.get('price');
    
    if (coins) setRequestedAmount(coins);
    if (price) setPaymentPrice(price);
  }, []);

  const createRequestMutation = useMutation({
    mutationFn: async (requestData) => {
      await base44.entities.CoinRequest.create(requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myRequests']);
      toast.success("Request sent successfully! Please complete payment via PayPal.");
      setMessage("");
    },
    onError: () => {
      toast.error("Failed to send request");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    const amount = parseInt(requestedAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const price = parseFloat(paymentPrice);
    if (!price || price <= 0) {
      toast.error("Invalid price");
      return;
    }

    createRequestMutation.mutate({
      user_id: user.id,
      user_name: user.full_name,
      user_email: user.email,
      message: message.trim(),
      requested_amount: amount,
      status: "pending",
    });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("udryve2025@gmail.com");
    setCopied(true);
    toast.success("PayPal email copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "bg-yellow-500/20 text-yellow-300 border-yellow-500",
      text: "Pending"
    },
    approved: {
      icon: CheckCircle,
      color: "bg-green-500/20 text-green-300 border-green-500",
      text: "Approved"
    },
    rejected: {
      icon: XCircle,
      color: "bg-red-500/20 text-red-300 border-red-500",
      text: "Rejected"
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Coins className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Purchase Coins
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Submit request & pay via PayPal to receive your coins</p>
          <p className="text-yellow-300 text-sm mt-2">
            ⚠️ Temporary manual process due to platform host issues - Automatic payment coming soon!
          </p>
        </div>

        {/* Request Form */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white font-semibold mb-2 block">Coin Amount</label>
              <Input
                type="number"
                placeholder="How many coins?"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                min="1"
                readOnly={!!new URLSearchParams(window.location.search).get('coins')}
              />
            </div>

            <div>
              <label className="text-white font-semibold mb-2 block">Price (USD)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Amount to pay"
                value={paymentPrice}
                onChange={(e) => setPaymentPrice(e.target.value)}
                className="bg-[#0a0a0f] border-[#2a2a3a] text-white"
                min="0.01"
                readOnly={!!new URLSearchParams(window.location.search).get('price')}
              />
            </div>

            <div>
              <label className="text-white font-semibold mb-2 block">Your Message (Optional)</label>
              <Textarea
                placeholder="Any notes or questions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-[#0a0a0f] border-[#2a2a3a] text-white h-24"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{message.length}/500</p>
            </div>

            <Button
              type="submit"
              disabled={createRequestMutation.isPending}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 font-bold py-6"
            >
              {createRequestMutation.isPending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Payment Instructions */}
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Payment Instructions</h3>
              <p className="text-gray-300 text-sm">Follow these steps to complete your purchase</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0a0a0f] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</span>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">Submit Your Request</p>
                  <p className="text-gray-400 text-sm">Fill out the form above with your desired coin amount</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0f] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</span>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-2">Send Payment via PayPal</p>
                  <p className="text-gray-400 text-sm mb-3">
                    Send <span className="text-yellow-400 font-bold">${paymentPrice || '0.00'}</span> to our PayPal account:
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-2 flex-1">
                      <p className="text-white font-mono">udryve2025@gmail.com</p>
                    </div>
                    <Button
                      onClick={handleCopyEmail}
                      variant="outline"
                      size="sm"
                      className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Use "Friends & Family" option to avoid fees
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0f] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</span>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">Include Your Email</p>
                  <p className="text-gray-400 text-sm">
                    Add your LiveTrollz email (<span className="text-cyan-400">{user?.email}</span>) in the PayPal notes
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0f] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">✓</span>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">Receive Your Coins</p>
                  <p className="text-gray-400 text-sm">
                    Once payment is confirmed, coins will be added to your account within 30 seconds
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-green-300 text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Lightning fast delivery: Coins added within 30 seconds!
            </p>
          </div>
        </Card>

        {/* Request History */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Your Requests</h2>
          {myRequests.length === 0 ? (
            <Card className="bg-[#1a1a24] border-[#2a2a3a] p-12 text-center">
              <Coins className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No requests yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => {
                const status = statusConfig[request.status];
                const StatusIcon = status.icon;

                return (
                  <Card key={request.id} className="bg-[#1a1a24] border-[#2a2a3a] p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                          <Coins className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-400">
                            {request.requested_amount?.toLocaleString()} coins
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(request.created_date), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${status.color} border flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.text}
                      </Badge>
                    </div>

                    {request.message && (
                      <div className="bg-[#0a0a0f] rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-400 mb-1">Your Message:</p>
                        <p className="text-white">{request.message}</p>
                      </div>
                    )}

                    {request.status !== 'pending' && request.admin_response && (
                      <div className={`rounded-lg p-4 border ${
                        request.status === 'approved' 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}>
                        <p className="text-sm text-gray-400 mb-1">Admin Response:</p>
                        <p className="text-white mb-2">{request.admin_response}</p>
                        {request.status === 'approved' && (
                          <div className="flex items-center gap-2 text-green-400 font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            Approved: {request.approved_amount?.toLocaleString()} {request.coin_type} coins
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
