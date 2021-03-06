from base_server import Base_handler, Server_thread
from collections import defaultdict as dd
import time, random, re

class Player():
    def __init__(self, name):
        self.name   =   name
        self.beat   =   time.time()
        self.coin   =   0
        self.ready  =   0

class GBV():
    def __init__(self):
        self.now      =  0
        self.players  =  dd(lambda: None)
        self.chat     =  []
        self.lines    =  []
        self.playing  =  0
        self.painter  =  0
        self.draw_id  =  0 # canvas round
        self.play_id  =  0 # game round

        self.resouse  =  ['wood', 'clay', 'wool', 'grain', 'ore'] * 4
        self.numbers  =  list(range(2, 12)) * 2 + [12]

    @property
    def alives(self):
        self.clean()
        res = [u for u in self.players if self.players[u]]
        return res

    @property
    def alives_name(self):
        return [self.players[u].name for u in self.alives]

    def clean(self):
        ima = time.time()
        for u in self.players:
            if self.players[u] and (abs(ima - self.players[u].beat) > 6):
                print('Die: {}, {}'.format(u, self.players[u].name))
                self.players[u] = None

    def beat(self, uid):
        if not self.players[uid]: return {'res' : 'dead'}
        self.players[uid].beat = time.time()
        # print('{} new beat: {}'.format(self.players[uid].name, self.players[uid].beat))
        return {'res' : 'ok'}
    
    def add_player(self, data):
        self.now += 1
        self.players[self.now] = Player(data['name'])
        print('New player: ', self.now, self.players[self.now].name)
        return {'uid' : self.now}

    def add_say(self, uid, cont):
        print('Add speak: ', self.players[uid].name, cont)
        self.chat.append((self.players[uid].name, cont))
        return {'res' : 0}

    def ask_say(self, x):
        if x>=len(self.chat): return {'n' : 0}
        return {'n' : len(self.chat)-x, 'data' : self.chat[x:]}

    def ask_info(self, uid):
        users = self.alives
        if self.playing==1 and len(users)<2: self.stop_game()

        coins = '\n'.join(['{}:{}'.format(self.players[i].name, self.players[i].coin) for i in users])
        return {
        }

    def gen_map(self):
        random.shuffle(self.resouse)
        random.shuffle(self.numbers)
        return {
            'map' : [(i+1, self.resouse[i], self.numbers[i]) for i in range(19)]
        }

    def start_game(self):
        self.gen_map()
        pass

    def stop_game(self):
        pass


    def player_ready(self, uid):
        if self.playing!=0: return {'res' : 1}
        print('{} get ready.'.format(self.players[uid].name))
        self.players[uid].ready = 1
        self.start_game()
        return {'res' : 0}

    def ask_others(self, uid):
        users = ['<tr> <td> {} </td> <td> {} </td> <td> {} </td> <td> {} </td> </tr>'.format(u, self.players[u].name, 0, self.players[u].ready) for u in self.alives]
        return {
            'n'  : len(users),
            'user' : users,
        }
        



class S(Base_handler):
    def run(self, data):
        global G
        if 'cmd' not in data: return
        if ('uid' in data) and (G.players[data['uid']]==None): return
        if data['cmd'] == 'reg':
            return G.add_player(data)

        elif data['cmd'] == 'beat':
            return G.beat(data['uid'])

        elif data['cmd'] == 'say':
            return G.add_say(data['uid'], data['cont'])

        elif data['cmd'] == 'ask_chat':
            return G.ask_say(data['from'])

        elif data['cmd'] == 'info':
            return G.ask_info(data['uid'])

        elif data['cmd'] == 'ready':
            return G.player_ready(data['uid'])

        elif data['cmd'] == 'others':
            return G.ask_others(data['uid'])

        elif data['cmd'] == 'map':
            return G.gen_map()



if __name__ == '__main__':
    global G
    G = GBV()
    td = Server_thread(S, 5659)
    td.start()

    while True:
        x = input('CMD: ')
        if x=='u':
            users = G.alives
            for u in users:
                print('{}, ready:{}, coin:{}'.format(G.players[u].name, G.players[u].ready, G.players[u].coin))
        elif x=='p':
            print('playing: {}, play_id: {}, painter: {}'.format(G.playing, G.play_id, G.painter))
