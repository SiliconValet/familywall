import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { CalendarAuthStatus, CalendarSource } from '@/types/calendar';

interface CalendarSettingsProps {
  open: boolean;
  onClose: () => void;
}

export function CalendarSettings({ open, onClose }: CalendarSettingsProps) {
  const [authStatus, setAuthStatus] = useState<CalendarAuthStatus>({ connected: false, email: null });
  const [sources, setSources] = useState<CalendarSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Fetch auth status and calendar sources when modal opens
  useEffect(() => {
    if (open) {
      fetchAuthStatus();
    }
  }, [open]);

  const fetchAuthStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar/status');
      if (!res.ok) throw new Error('Failed to fetch calendar status');
      const data: CalendarAuthStatus = await res.json();
      setAuthStatus(data);

      // If connected, fetch calendar sources
      if (data.connected) {
        const sourcesRes = await fetch('/api/calendar/sources');
        if (!sourcesRes.ok) throw new Error('Failed to fetch calendar sources');
        const sourcesData: CalendarSource[] = await sourcesRes.json();
        setSources(sourcesData);
      }
    } catch (err) {
      console.error('Failed to fetch calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/calendar/auth');
      if (!res.ok) throw new Error('Failed to get OAuth URL');
      const data: { authUrl: string } = await res.json();
      window.location.href = data.authUrl;
    } catch (err) {
      console.error('Failed to initiate OAuth:', err);
    }
  };

  const handleToggleCalendar = async (sourceId: string, newSelected: boolean) => {
    try {
      const url = `/api/calendar/sources/${encodeURIComponent(sourceId)}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: newSelected }),
      });
      if (!res.ok) {
        throw new Error('Failed to toggle calendar');
      }

      // Update local state
      setSources(sources.map(s => s.id === sourceId ? { ...s, selected: newSelected } : s));
    } catch (err) {
      console.error('Failed to toggle calendar:', err);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch('/api/calendar/disconnect', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to disconnect calendar');

      // Reset state
      setAuthStatus({ connected: false, email: null });
      setSources([]);
      setShowDisconnectConfirm(false);
      onClose();
    } catch (err) {
      console.error('Failed to disconnect calendar:', err);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <>
      <Dialog open={open && !showDisconnectConfirm} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Calendar Settings</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !authStatus.connected ? (
            // Not Connected State
            <div className="space-y-4 py-4">
              <h3 className="text-2xl font-heading">No Calendar Connected</h3>
              <p className="text-base">
                Connect your Google Calendar to sync events and view them alongside your family's chores.
              </p>
              <Button
                onClick={handleConnect}
                className="w-full min-h-12"
                variant="default"
              >
                Connect Calendar
              </Button>
            </div>
          ) : (
            // Connected State
            <div className="space-y-6 py-2">
              {/* Section 1: Connected Account */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Connected Account</h4>
                <p className="text-lg">{authStatus.email}</p>
                <Button
                  onClick={() => setShowDisconnectConfirm(true)}
                  className="w-full min-h-12"
                  variant="destructive"
                >
                  Disconnect
                </Button>
              </div>

              {/* Divider */}
              <div className="border-t border-border"></div>

              {/* Section 2: Calendars to Display */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Calendars to Display</h4>
                <div className="space-y-2">
                  {sources.map((source, index) => {
                    return (
                      <div key={index} className="flex items-center gap-2 min-h-12">
                        <Checkbox
                          id={`calendar-${index}`}
                          checked={source.selected}
                          onCheckedChange={(checked) => {
                            handleToggleCalendar(source.id, checked === true);
                          }}
                        />
                        <Label
                          htmlFor={`calendar-${index}`}
                          className="text-lg cursor-pointer flex-1"
                        >
                          {source.summary}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={onClose}
                  className="min-h-12"
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={showDisconnectConfirm} onOpenChange={(isOpen) => !isOpen && setShowDisconnectConfirm(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disconnect Calendar?</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <p className="text-base">
              Events will no longer sync. You can reconnect anytime.
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                onClick={() => setShowDisconnectConfirm(false)}
                className="min-h-12"
                variant="outline"
                disabled={disconnecting}
              >
                Keep Connected
              </Button>
              <Button
                onClick={handleDisconnect}
                className="min-h-12"
                variant="destructive"
                disabled={disconnecting}
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
