import { ITelegramGoods } from './ITelegramGoods';

export interface IOrderMsg {
  code: string;
  sourceName: string;
  deliveryTypeName: string;
  createdAt: Date;
  customerFullName: string;
  customerPhone: string;
  shipmentAddress?: string;
  status: string;
  bonusOut: string;
  gooods: ITelegramGoods[];
  total: string;
  promocode?: string;
  commentOrder?: string;
  msgIds?: { msgId: number; chatId: number }[];
}
