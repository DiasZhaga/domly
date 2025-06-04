package interfaces

import "context"

type PingerI interface {
	Ping(ctx context.Context) error
}

type CloserI interface {
	Close() error
}

type ShutdownerI interface {
	Close()
}

type JobI interface {
	Run()
}
