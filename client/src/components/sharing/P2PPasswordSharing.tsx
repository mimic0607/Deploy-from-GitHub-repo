import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  initializePeerConnection, 
  createOffer, 
  acceptOffer, 
  processAnswer,
  sendP2PData,
  closePeerConnection,
  createP2PSharePackage
} from "@/lib/decentralization";
import { Loader2, Share2, Wifi, Fingerprint, Copy, Download, ArrowRight } from 'lucide-react';
import { VaultItem } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function P2PPasswordSharing() {
  // Connection states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState<'offer' | 'answer' | null>(null);
  const [offerSDP, setOfferSDP] = useState('');
  const [answerSDP, setAnswerSDP] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedVaultItem, setSelectedVaultItem] = useState<string>('');
  const [receivedCredential, setReceivedCredential] = useState<any>(null);
  const [showReceivedDialog, setShowReceivedDialog] = useState(false);

  // Fetch vault items for sharing
  const { data: vaultItems } = useQuery<VaultItem[]>({
    queryKey: ['/api/vault'],
  });

  useEffect(() => {
    // Cleanup the connection when component unmounts
    return () => {
      closePeerConnection();
    };
  }, []);

  // Initialize WebRTC connection
  const handleInitConnection = async (mode: 'offer' | 'answer') => {
    try {
      setIsConnecting(true);
      setConnectionMode(mode);
      
      // Initialize the peer connection
      const newSessionId = await initializePeerConnection();
      setSessionId(newSessionId);
      
      // If initiating the connection, create an offer
      if (mode === 'offer') {
        const offer = await createOffer();
        if (offer) {
          setOfferSDP(offer);
        }
      }
      
      setIsConnecting(false);
    } catch (error) {
      console.error('Connection initialization error:', error);
      toast({
        title: "Connection failed",
        description: "Failed to initialize P2P connection",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  // Create an answer to an offer
  const handleCreateAnswer = async () => {
    if (!offerSDP) {
      toast({
        title: "Invalid offer",
        description: "Please paste a valid connection offer",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      const answer = await acceptOffer(offerSDP);
      if (answer) {
        setAnswerSDP(answer);
        setIsConnected(true);
      }
      setIsConnecting(false);
    } catch (error) {
      console.error('Error creating answer:', error);
      toast({
        title: "Connection failed",
        description: "Failed to create connection answer",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  // Process the answer from the other peer
  const handleProcessAnswer = async () => {
    if (!answerSDP) {
      toast({
        title: "Invalid answer",
        description: "Please paste a valid connection answer",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      await processAnswer(answerSDP);
      setIsConnected(true);
      setIsConnecting(false);
      
      toast({
        title: "Connected",
        description: "P2P connection established successfully",
      });
    } catch (error) {
      console.error('Error processing answer:', error);
      toast({
        title: "Connection failed",
        description: "Failed to establish connection",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  // Share a credential with the connected peer
  const handleShareCredential = () => {
    if (!isConnected || !sessionId) {
      toast({
        title: "Not connected",
        description: "Please establish a connection first",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedVaultItem) {
      toast({
        title: "No credential selected",
        description: "Please select a credential to share",
        variant: "destructive",
      });
      return;
    }
    
    // Find the selected vault item
    const vaultItem = vaultItems?.find(item => item.id.toString() === selectedVaultItem);
    if (!vaultItem) {
      toast({
        title: "Credential not found",
        description: "The selected credential could not be found",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create a P2P share package with the credential
      const sharePackage = createP2PSharePackage(vaultItem, sessionId);
      
      // Send the package through the WebRTC data channel
      sendP2PData(sharePackage);
      
      toast({
        title: "Credential shared",
        description: "The credential has been shared with the connected peer",
      });
    } catch (error) {
      console.error('Error sharing credential:', error);
      toast({
        title: "Share failed",
        description: "Failed to share the credential",
        variant: "destructive",
      });
    }
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description,
      });
    });
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Peer-to-Peer Credential Sharing
          </CardTitle>
          <CardDescription>
            Share credentials directly between browsers with end-to-end encryption
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="initiate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="initiate">Initiate Connection</TabsTrigger>
              <TabsTrigger value="join">Join Connection</TabsTrigger>
            </TabsList>
            
            {/* Initiate Connection Tab */}
            <TabsContent value="initiate" className="space-y-4">
              {!connectionMode && (
                <Button
                  onClick={() => handleInitConnection('offer')}
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Wifi className="h-4 w-4 mr-2" />
                  )}
                  {isConnecting ? "Initializing..." : "Start Connection"}
                </Button>
              )}
              
              {connectionMode === 'offer' && !isConnected && (
                <>
                  <div className="space-y-2">
                    <Label>Connection Offer (Send this to the other person)</Label>
                    <div className="relative">
                      <Textarea
                        value={offerSDP}
                        readOnly
                        className="min-h-[100px] font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(offerSDP, "Connection offer copied to clipboard")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Paste Answer from Other Person</Label>
                    <Textarea
                      value={answerSDP}
                      onChange={(e) => setAnswerSDP(e.target.value)}
                      placeholder="Paste the answer here..."
                      className="min-h-[100px] font-mono text-xs"
                    />
                  </div>
                  
                  <Button
                    onClick={handleProcessAnswer}
                    disabled={isConnecting || !answerSDP}
                    className="w-full"
                  >
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    {isConnecting ? "Connecting..." : "Complete Connection"}
                  </Button>
                </>
              )}
            </TabsContent>
            
            {/* Join Connection Tab */}
            <TabsContent value="join" className="space-y-4">
              {!connectionMode && (
                <div className="space-y-2">
                  <Label>Paste Offer from Other Person</Label>
                  <Textarea
                    value={offerSDP}
                    onChange={(e) => setOfferSDP(e.target.value)}
                    placeholder="Paste the connection offer here..."
                    className="min-h-[100px] font-mono text-xs"
                  />
                  
                  <Button
                    onClick={() => handleInitConnection('answer')}
                    disabled={isConnecting || !offerSDP}
                    className="w-full"
                  >
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Wifi className="h-4 w-4 mr-2" />
                    )}
                    {isConnecting ? "Processing..." : "Join Connection"}
                  </Button>
                </div>
              )}
              
              {connectionMode === 'answer' && (
                <>
                  <div className="space-y-2">
                    <Label>Your Answer (Send this back to the other person)</Label>
                    <div className="relative">
                      <Textarea
                        value={answerSDP}
                        readOnly
                        className="min-h-[100px] font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(answerSDP, "Connection answer copied to clipboard")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleCreateAnswer}
                    disabled={isConnecting || isConnected}
                    className="w-full"
                  >
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    {isConnecting ? "Creating answer..." : "Create Answer"}
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          {isConnected && (
            <div className="w-full space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Share Credentials</h3>
                <div className="flex items-center gap-2 text-xs text-green-500">
                  <Fingerprint className="h-3 w-3" />
                  Connected
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="selectCredential">Select Credential to Share</Label>
                <Select
                  value={selectedVaultItem}
                  onValueChange={setSelectedVaultItem}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select credential" />
                  </SelectTrigger>
                  <SelectContent>
                    {vaultItems?.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name} ({item.url || 'No URL'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={handleShareCredential}
                disabled={!selectedVaultItem}
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Selected Credential
              </Button>
            </div>
          )}
          
          <div className="w-full text-xs text-muted-foreground text-center">
            All sharing is done directly between browsers with end-to-end encryption.
            No data passes through our servers.
          </div>
        </CardFooter>
      </Card>
      
      {/* Dialog for received credentials */}
      <Dialog open={showReceivedDialog} onOpenChange={setShowReceivedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credential Received</DialogTitle>
            <DialogDescription>
              You've received a credential via secure P2P connection
            </DialogDescription>
          </DialogHeader>
          
          {receivedCredential && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input value={receivedCredential.name} readOnly />
              </div>
              
              <div className="grid gap-2">
                <Label>Website</Label>
                <Input value={receivedCredential.url || ''} readOnly />
              </div>
              
              <div className="grid gap-2">
                <Label>Username</Label>
                <Input value={receivedCredential.username} readOnly />
              </div>
              
              <div className="grid gap-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input value={receivedCredential.password} type="password" readOnly />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-0 right-0"
                    onClick={() => copyToClipboard(receivedCredential.password, "Password copied to clipboard")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowReceivedDialog(false)}>Close</Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Save to Vault
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}