import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { ExternalLink, Shield, Share2 } from "lucide-react";
import ExportImportVault from "@/components/vault/ExportImportVault";
import P2PPasswordSharing from "@/components/sharing/P2PPasswordSharing";

export default function DecentralizedFeatures() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <PageHeader
        title="Decentralized Features"
        description="Take control of your data with local storage and peer-to-peer sharing options"
        icon={<Shield className="h-6 w-6" />}
      />
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">What is Decentralization?</h2>
        <p className="text-muted-foreground">
          Decentralization puts you in control of your data. Instead of storing everything on our servers,
          these features allow you to manage your passwords locally and share them directly with others without
          going through a central server.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 text-sm">
          <div className="flex-1 border rounded-lg p-4 bg-card">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              End-to-End Encryption
            </h3>
            <p className="text-muted-foreground">
              Your passwords are encrypted on your device before being sent anywhere.
              This means even we can't see your sensitive data.
            </p>
          </div>
          
          <div className="flex-1 border rounded-lg p-4 bg-card">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Export & Import
            </h3>
            <p className="text-muted-foreground">
              Create fully encrypted backups of your password vault that only you can decrypt.
              Keep local copies of your data that aren't dependent on our service.
            </p>
          </div>
          
          <div className="flex-1 border rounded-lg p-4 bg-card">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Peer-to-Peer Sharing
            </h3>
            <p className="text-muted-foreground">
              Share passwords directly between browsers with WebRTC technology.
              No intermediary servers see your unencrypted data.
            </p>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="export-import" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="export-import">Export & Import</TabsTrigger>
          <TabsTrigger value="p2p-sharing">P2P Sharing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="export-import" className="mt-6">
          <ExportImportVault />
        </TabsContent>
        
        <TabsContent value="p2p-sharing" className="mt-6">
          <div className="max-w-2xl mx-auto">
            <P2PPasswordSharing />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}