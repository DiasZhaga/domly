package models

import (
	"fmt"
	"runtime"
	"runtime/debug"
)

type PanicReport struct {
	Reason string
	File   string
	Func   string
	Line   int
	Stack  string
}

func GetPanicReport(skip int, r any) PanicReport {
	pc, file, line, _ := runtime.Caller(skip)
	fn := runtime.FuncForPC(pc)
	return PanicReport{
		Reason: fmt.Sprintf("%v", r),
		File:   file,
		Func:   fn.Name(),
		Line:   line,
		Stack:  string(debug.Stack()),
	}
}
