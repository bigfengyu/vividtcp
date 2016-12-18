export class MessageLength {
     static srcPort = 16;       // 16bit
     static distPort = 16;      // 16bit
     static seqNum = 32;        // 32bit
     static ackNum = 32;        // 32bit
     static headerLength = 4;  //  4bit
     static flags = 6;         //  6bit
     static receiveWindow = 16; // 16bit
     static checksum = 16;      // 16bit
     static UrgentPointer = 16; // 16bit
     static options = -1;       // 可选与变长
     static data = -1;          // 可选与变长
}

export class Message {
     srcPort;       // 16bit
     distPort;      // 16bit
     seqNum;        // 32bit positive or -1
     ackNum;        // 32bit positive or -1
     headerLength;  //  4bit
     flags;         //  6bit
     receiveWindow; // 16bit
     checksum = 'match';      // 16bit  match or unmatch
     UrgentPointer; // 16bit
     options;       // 可选与变长
     data;          // 可选与变长
}
