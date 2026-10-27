import React from 'react';
import { TicketingPortalApp } from './TicketingPortalApp';

/**
 * Embedded Ticketing Module rendered inside the Cooknow Business Management Shell.
 * Shares full interactive state, real-time inventory sync, mandatory Waybill receipt upload,
 * dynamic category creation, public/internal notes with WhatsApp/Email dispatch, and severity adjustments.
 */
export const TicketingModule: React.FC = () => {
  return <TicketingPortalApp isEmbedded={true} />;
};
