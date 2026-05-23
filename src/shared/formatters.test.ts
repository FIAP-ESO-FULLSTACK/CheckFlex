import { describe, expect, it } from "vitest";
import { formatCpf, formatReservationCode } from "@/shared/formatters";

describe("formatReservationCode", () => {
  it("retorna apenas as letras enquanto o prefixo está incompleto", () => {
    expect(formatReservationCode("c")).toBe("C");
    expect(formatReservationCode("ck")).toBe("CK");
  });

  it("acrescenta o traço assim que o prefixo de três caracteres é completado", () => {
    expect(formatReservationCode("ckf")).toBe("CKF-");
  });

  it("insere o traço entre o prefixo e o restante", () => {
    expect(formatReservationCode("ckf5")).toBe("CKF-5");
    expect(formatReservationCode("ckf50")).toBe("CKF-50");
    expect(formatReservationCode("ckf5042")).toBe("CKF-5042");
  });

  it("tolera traços e espaços já digitados", () => {
    expect(formatReservationCode("CKF-5042")).toBe("CKF-5042");
    expect(formatReservationCode("ckf 5042")).toBe("CKF-5042");
    expect(formatReservationCode("-CKF--5042-")).toBe("CKF-5042");
  });

  it("limita o tamanho final ao formato esperado", () => {
    expect(formatReservationCode("CKF50421234567")).toBe("CKF-50421234");
  });
});

describe("formatCpf", () => {
  it("retorna apenas dígitos enquanto o primeiro bloco não está completo", () => {
    expect(formatCpf("")).toBe("");
    expect(formatCpf("1")).toBe("1");
    expect(formatCpf("12")).toBe("12");
  });

  it("insere o primeiro ponto assim que o terceiro dígito é digitado", () => {
    expect(formatCpf("123")).toBe("123.");
    expect(formatCpf("1234")).toBe("123.4");
    expect(formatCpf("12345")).toBe("123.45");
  });

  it("insere o segundo ponto após o sexto dígito", () => {
    expect(formatCpf("123456")).toBe("123.456.");
    expect(formatCpf("1234567")).toBe("123.456.7");
    expect(formatCpf("12345678")).toBe("123.456.78");
  });

  it("insere o traço após o nono dígito", () => {
    expect(formatCpf("123456789")).toBe("123.456.789-");
    expect(formatCpf("1234567890")).toBe("123.456.789-0");
    expect(formatCpf("12345678909")).toBe("123.456.789-09");
  });

  it("ignora caracteres não numéricos e limita ao tamanho do CPF", () => {
    expect(formatCpf("abc1234")).toBe("123.4");
    expect(formatCpf("123.456.789-09extra")).toBe("123.456.789-09");
    expect(formatCpf("123456789091234")).toBe("123.456.789-09");
  });
});
