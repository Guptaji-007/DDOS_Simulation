import time
import random
import json
from faker import Faker

fake = Faker()

ATTACK_TYPES = ['UDP_FLOOD', 'SYN_FLOOD', 'SLOWLORIS', 'ICMP_FLOOD']


class NetworkPacket:
    def __init__(
        self,
        timestamp,
        source_ip,
        destination_ip,
        source_port,
        destination_port,
        protocol,
        packet_size,
        attack_type,
        magnitude
    ):
        self.timestamp = timestamp
        self.source_ip = source_ip
        self.destination_ip = destination_ip
        self.source_port = source_port
        self.destination_port = destination_port
        self.protocol = protocol
        self.packet_size = packet_size
        self.attack_type = attack_type
        self.magnitude = magnitude

    def to_dict(self):
        return {
            "timestamp": self.timestamp,
            "source_ip": self.source_ip,
            "destination_ip": self.destination_ip,
            "source_port": self.source_port,
            "destination_port": self.destination_port,
            "protocol": self.protocol,
            "packet_size": self.packet_size,
            "attack_type": self.attack_type,
            "magnitude": self.magnitude
        }


def generate_random_traffic():
    while True:
        packet = NetworkPacket(
            timestamp=time.time(),
            source_ip=fake.ipv4(),
            destination_ip=fake.ipv4(),
            source_port=random.randint(1024, 65535),
            destination_port=random.randint(1024, 65535),
            protocol=random.choice(["TCP", "UDP"]),
            packet_size=random.randint(100, 1500),
            attack_type=random.choice(ATTACK_TYPES),
            magnitude=random.randint(1, 100)
        )
        yield packet
        time.sleep(random.uniform(0.1, 0.5))


def save_traffic_to_file(filename, num_packets=100):
    traffic_generator = generate_random_traffic()

    with open(filename, "w") as file:  # overwrite to avoid corruption
        for _ in range(num_packets):
            packet = next(traffic_generator)
            json.dump(packet.to_dict(), file)
            file.write("\n")
            file.flush()


def run_continuous_writer(filename):
    """Append generated packets to `filename` forever. Use for continuous simulation."""
    traffic_generator = generate_random_traffic()
    with open(filename, "a") as file:
        try:
            while True:
                packet = next(traffic_generator)
                json.dump(packet.to_dict(), file)
                file.write("\n")
                file.flush()
        except KeyboardInterrupt:
            print("Continuous writer stopped by user")



if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate network traffic JSONL")
    parser.add_argument("--continuous", action="store_true", help="Run continuous writer (append)")
    parser.add_argument("--file", default="network_traffic.jsonl", help="Output filename")
    parser.add_argument("--count", type=int, default=100, help="Number of packets (non-continuous)")
    args = parser.parse_args()

    if args.continuous:
        run_continuous_writer(args.file)
    else:
        save_traffic_to_file(args.file, num_packets=args.count)
