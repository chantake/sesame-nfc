import os, sys, signal, time, json, re, binascii
import nfc

TIME_cycle = 1.0
TIME_interval = 0.2
TIME_wait = 3

non_touchend = ('non-touchend' in sys.argv)
non_loop = ('non-loop' in sys.argv) or non_touchend

running = True
exiting = False

def sig_hup_handler(signo, frame):
    global running
    global exiting
    if running:
        running = False
        os.kill(os.getpid(), signal.SIGINT)
    exiting = True

def sig_chld_handler(signo, frame):
    global running
    running ^= True
    if not(running):
        os.kill(os.getpid(), signal.SIGINT)

signal.signal(signal.SIGHUP, sig_hup_handler)
signal.signal(signal.SIGCHLD, sig_chld_handler)

def stdout_json(data):
    sys.stdout.write(json.dumps(data))
    sys.stdout.write('\n')
    sys.stdout.flush()

def on_connect(tag):
    id = str(tag.identifier).encode('hex').upper()
    stdout_json({'event':'touchstart', 'id':id, 'type':tag.type})
    return not(non_touchend)

if __name__ == '__main__':
    while True:
        if running:
            with nfc.ContactlessFrontend('usb') as clf:
                # 212F(FeliCa)
                target_req = nfc.clf.RemoteTarget("212F")
                # 0003(Suica)
                target_req.sensf_req = bytearray.fromhex("0000030000")
                # 106A(NFC type A)
                target_req_nfc = nfc.clf.RemoteTarget("106A")
                while True:
                  target_res = clf.sense(target_req, target_req_nfc, terations=int(TIME_cycle//TIME_interval)+1 , interval=TIME_interval)
                  if target_res != None:
                    tag = nfc.tag.activate(clf, target_res)
                    #tag = nfc.tag.activate_tt3(clf, target_res)
                    #tag.sys = 3
                    on_connect(tag)
                    time.sleep(TIME_wait)
                    if non_loop:
                        running = False
                        break
        elif not(exiting):
            time.sleep(0.1)
        else:
            break
