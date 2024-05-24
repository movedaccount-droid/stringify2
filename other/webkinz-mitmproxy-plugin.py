"""Process individual messages from a WebSocket connection."""
import logging
import re
from os import listdir, makedirs
from os.path import isfile, join
import time
import calendar
from collections.abc import Sequence

from mitmproxy import ctx
from mitmproxy import http, command, flow

class webkinzaddon:
    def __init__(self):
        self.webkinzdisabled = False
        self.timestamp = calendar.timegm(time.gmtime())
        makedirs(str(self.timestamp))
        self.haltedpacketid = 0
        self.lastpacket = ""
        self.twoprevpacket = ""

    def save_packet(self, bytes: bytes):
        filenamebase = str(self.timestamp) + "/" + str(self.haltedpacketid)
        self.write_bytes_to_file(bytes, filenamebase)
        self.haltedpacketid += 1

    def write_bytes_to_file(self, bytes: bytes, name: str):
        f = open(name, "wb")
        f.write(bytes)
        f.close()

    def contains_base64(self, bytes: bytes):
        # we want to read as a string, so we should do that
        return "MTA".encode("utf-8") in bytes

    def pb(self, bytes: bytes):
       # if len(bytes) == 0:
       #     return ""
       # if len(bytes) == 1:
       #     return '\\x' + bytes
        return ''.join(['\\x%02x' % b for b in bytes])
        
    @command.command("webkinz.halt")
    def halt(self) -> None:
        self.webkinzdisabled = True
        logging.warning(f"--- ALL TRAFFIC HALTED ---")
        
    @command.command("webkinz.unhalt")
    def unhalt(self) -> None:
        self.webkinzdisabled = False
        logging.warning(f"--- ALL TRAFFIC UNHALTED ---")

    @command.command("webkinz.inject")
    def inject_packet(self, flows: Sequence[flow.Flow], template: str):
        for flow in flows:
            if hasattr(flow, 'marker') and flow.marker == "user":
                # currently: injects user request packet
                embedded_bytes = self.read_and_close_bytes("packetfilters/inject/" + template)
                logging.info(f"embedded_bytes: {embedded_bytes}")
                ctx.master.commands.call(
                    "inject.websocket", flow, False, embedded_bytes, False
                )

    @command.command("cl")
    def cl(self):
        logging.info("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")

    def read_and_close_bytes(self, file):
        f = open(file, "rb")
        b = f.read()
        f.close()
        return b
       
    def read_and_close_string(self, file):
        f = open(file, "r")
        s = f.read()
        f.close()
        return s

    def text_to_hex(self, string):
        return bytes.fromhex(string.replace(":", ""))

    def manip_packet(self, bytes: bytes, message):
        mypath = "/mnt/disk-ethereal1/mitmproxy/mitmproxy/examples/addons/packetfilters"
        files = [f for f in listdir(mypath) if isfile (join(mypath, f))]
        filters = [f for f in files if "-" not in f]
        
        replacement = b''
        replaced_with = ""
        
        for f in filters:
            # folder hack
            f = "packetfilters/" + f
            match = self.read_and_close_bytes(f)
            match_mask = self.read_and_close_string(f + "-mask")
            replace = self.read_and_close_bytes(f + "-replacement")
            replace_mask = self.read_and_close_string(f + "-replacementmask")
            
            if self.match_bytes(bytes, match, match_mask):
                logging.info("--- DROPPED PACKET ---")
                logging.info(f"origl: {bytes!r}")
                self.webkinzdisabled = True
                # if replacement == b'':
                #     replacement = self.replace_bytes(bytes, replace, replace_mask)
                #     logging.info("--- REPLACED PACKET ---")
                #     logging.info(f"origl: {bytes!r}")
                #     logging.info(f"mtchr: {match}")
                #     logging.info(f"rplce: {replacement!r}")
                # else:
                #     logging.warning("WARNING: PACKET MATCH COLLISION")
                #     logging.warning(f"already-matched packet for {replaced_with} also matched {match}, continuing with {replaced_with}")
        
        if replacement == b'':
            replacement = bytes
        return replacement
        
    def match_bytes(self, bytes: bytes, match: bytes, mask: str):
        if len(bytes) != len(match):
            logging.warning(f"failed on length")
            return False
        for i, j in enumerate(bytes):
            logging.warning(f"testing {i}, {j}, mask is {mask[i]}")
            if mask[i] == "0":
                continue
            if j != match[i]:
                logging.warning(f"failed on byte {i}: {match[i]} did not match {j}")
                logging.warning(f"bytes: {self.pb(bytes)}")
                logging.warning(f"match: {self.pb(match)}")
                return False
        logging.warning(f"matched!! returning true")
        return True

    def replace_bytes(self, bytes: bytes, replace: bytes, mask: str):
        replacement = b''
        for i, j in enumerate(bytes):
            logging.warning(f"replacement {i}, {bytes[i]} with {replace[i]} of mask {mask[i]}")
            if mask[i] == "0":
                logging.warning(f"skipping... now {self.pb(replacement)}")
                replacement += (bytes[i]).to_bytes(1,"little")
                continue
            replacement += (replace[i]).to_bytes(1,"little")
            logging.warning(f"replacing... now {self.pb(replacement)}")
        logging.warning(f"replaced {self.pb(bytes)} with {self.pb(replacement)}")
        return replacement
    
    def request(self, flow: http.HTTPFlow):
        # mark streams according to role
        if flow.request.host_header == "user.webkinz.com":
            flow.marker = "user"
        elif flow.request.host_header == "sync1.webkinz.com" or flow.request.host_header == "sync2.webkinz.com":
            flow.marker = "sync"
        elif flow.request.host_header == "web.webkinz.com":
            logging.warning(f"cdn request made")

    def websocket_message(self, flow: http.HTTPFlow):
        assert flow.websocket is not None  # make type checker happy
        # throw to relevant stream handler
        try:
            if flow.marker == "user":
                self.handle_user_message(flow)
            elif flow.marker == "sync":
                self.handle_sync_message(flow)
            else:
                logging.info("received message from unknown flow, ignoring")
        except AttributeError:
            logging.info("ignoring non-traffic")


    def handle_sync_message(self, flow):
        logging.info("received sync message, ignoring")

    def handle_user_message(self, flow: http.HTTPFlow):
        # get the latest message
        message = flow.websocket.messages[-1]
        if (not message.injected):
            # if flow is disabled, stop receiving and start logging
            # check for b64 content
            # trunc_content = (self.pb(message.content))[0:127] + ("..." if len(message.content) >= 128 else "")
            # if self.contains_base64(message.content):
            #     logging.warning(f"--- BASE64 DETECTED! ---")
            #     logging.info(f"in: {trunc_content}")
            #     logging.info(f"check ./{str(self.timestamp)}/{str(self.haltedpacketid)} for info")
            #     self.save_packet(message.content)
            # if self.webkinzdisabled:
            #     logging.info(f"dropped packet: {trunc_content}")

            # we just want to log everything now
            self.save_packet(message.content)

            # else check for manip
            # else:
            replacement_content = self.manip_packet(message.content, message)
            if replacement_content != message.content:
                message.content = replacement_content
                self.webkinzdisabled = True
            # cache packet for later comparison on cdn requests
            if (message.from_client):
                self.twoprevpacket = self.lastpacket
                self.lastpacket = message.content
        else:
            logging.warning(f"injected message detected!")
            logging.info(f"injected {message.content}")
            self.twoprevpacket = self.lastpacket
            self.lastpacket = message.content

        # manipulate the message content
        #message.content = re.sub(rb".", b"H", message.content)

addons = [webkinzaddon()]
