import { _decorator, CCFloat, CCInteger, Component, Vec3 } from 'cc';
import { CoinGroundStack } from './CoinGroundStack';
import { CoinPool } from './CoinPool';
import { ResourceType } from './ResourceType';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
const { ccclass, property } = _decorator;

/**
 * **재료 두 가지를 합쳐 결과물 하나를 뱉는 가공 시설.** 씬 3의 대장간이 이것이다 —
 * 나무 1 + 철 1 → 칼 1.
 *
 * **"대장간"이라는 이름을 코드에 넣지 않았다.** 무엇을 받아 무엇을 뱉는지가 전부 인스펙터
 * 값이므로, 같은 컴포넌트로 제련소·제분소·요리대를 만들 수 있다. 다음 광고에서 재료 조합만
 * 바꿔 그대로 쓰는 것이 이 프로젝트의 목적이다.
 *
 * **투입도 산출도 전부 `CoinGroundStack`으로 한다.** 플레이어가 재료를 놓는 자리, 완성품이
 * 쌓이는 자리가 창고·상점과 완전히 같은 부품이라, 손맛(가까이 가면 하나씩 빨려들고 하나씩
 * 쌓이는 것)이 게임 전체에서 같아진다. 새 적재 로직을 만들지 않는다.
 *
 * 투입 소켓은 **`플레이어에게서 받기` 켜고 `돌려주기` 꺼야** 한다 — 안 그러면 플레이어가
 * 놓는 순간 되빨려 재료가 쌓이지 않는다. 산출 소켓은 반대로 `돌려주기`만 켠다.
 *
 * 설정되지 않으면 무동작이다 — 소켓 셋 중 하나라도 비어 있으면 아무 일도 하지 않는다.
 */
@ccclass('Forge')
export class Forge extends Component {
    @property({ type: CoinGroundStack, displayName: '재료 소켓 A', tooltip: '첫 번째 재료가 쌓이는 자리. 씬 3에서는 나무다. 이 소켓의 "받는 자원"이 곧 재료 종류이므로 여기서 따로 지정하지 않는다 — 두 군데서 관리하면 반드시 어긋난다' })
    inputA: CoinGroundStack | null = null;

    @property({ type: CCInteger, displayName: '재료 A 소비량', tooltip: '한 번 만들 때 소비하는 첫 번째 재료의 개수. 이만큼 쌓여 있지 않으면 제작을 시작하지 않는다(모자란 만큼만 만들지 않는다 — 반쪽 제작은 재료만 먹고 결과가 안 나오는 것처럼 보인다)' })
    costA: number = 1;

    @property({ type: CoinGroundStack, displayName: '재료 소켓 B', tooltip: '두 번째 재료가 쌓이는 자리. 씬 3에서는 철이다. 재료가 한 가지뿐인 시설을 만들려면 아래 "재료 B 소비량"을 0으로 두고 이 칸을 비운다' })
    inputB: CoinGroundStack | null = null;

    @property({ type: CCInteger, displayName: '재료 B 소비량', tooltip: '두 번째 재료의 개수. **0이면 두 번째 재료를 쓰지 않는다** — 재료 한 가지로 결과물을 만드는 시설이 된다' })
    costB: number = 1;

    @property({ type: CoinGroundStack, displayName: '산출 소켓', tooltip: '완성품이 쌓이는 자리. 플레이어가 여기 와서 가져간다. 이 소켓의 "받는 자원"이 곧 완성품 종류다(씬 3에서는 칼). 비워두면 이 시설은 아무 일도 하지 않는다' })
    output: CoinGroundStack | null = null;

    @property({ type: CCInteger, displayName: '1회 산출량', tooltip: '한 번 만들 때 나오는 완성품 개수. 재료 소비량과 함께 이 게임의 수익률을 정한다 — 칼 한 자루가 나무1+철1이고 손님이 칼 3개에 코인 5개를 낸다면, 그 비율이 여기서 시작한다' })
    yieldCount: number = 1;

    @property({ type: CoinPool, displayName: '코인 풀', tooltip: '완성품을 산출 소켓으로 날려보낼 때 쓰는 풀 — 씬의 CoinSystem에 있는 것과 같은 것을 연결한다' })
    coinPool: CoinPool | null = null;

    @property({ type: CCFloat, displayName: '제작 시간(초)', tooltip: '재료가 갖춰진 뒤 완성품이 나오기까지 걸리는 시간. 재료는 **제작을 시작하는 순간 빨려 들어간다** — 도중에 플레이어가 재료를 회수해 제작이 무효가 되는 일이 없게 하려는 것이다. 짧으면 재료를 넣는 즉시 쏟아져 나오고, 길면 대장간 앞에서 기다리게 된다' })
    craftDuration: number = 1.2;

    @property({ type: CCFloat, displayName: '재료 빨려가는 간격(초)', tooltip: '재료를 한 개씩 대장간으로 날려보내는 주기. 작으면 우르르 빨려 들어간다' })
    intakeInterval: number = 0.1;

    @property({ type: CCFloat, displayName: '완성품 출발 높이(m)', tooltip: '완성품이 대장간 발밑보다 이만큼 위에서 튀어나온다. 0이면 바닥에서 솟는 것처럼 보인다' })
    outputHeight: number = 1;

    @property({ type: TriggerId, displayName: '가동 트리거', tooltip: '이 트리거가 발화할 때까지 아무것도 만들지 않는다. None(기본)이면 처음부터 돌아간다. 씬 3에서는 대장간이 건설되는 트리거(4)를 넣는다 — 건물이 없는데 칼이 나오면 안 된다' })
    startTriggerId: TriggerId = TriggerId.None;

    /** 제작 단계. 재료를 빨아들이는 중인지, 굽는 중인지. */
    private _intaking = false;
    private _tookA = 0;
    private _tookB = 0;
    private _intakeTimer = 0;
    private _craftTimer = 0;
    private _crafting = false;
    private _started = false;

    onLoad() {
        this._started = this.startTriggerId === TriggerId.None;
        if (!this._started) CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (triggerId === this.startTriggerId) this._started = true;
    }

    update(dt: number) {
        if (!this._started) return;
        if (!this.output || !this.coinPool) return;
        if (!this.inputA) return;

        if (this._crafting) { this._tickCraft(dt); return; }
        if (this._intaking) { this._tickIntake(dt); return; }

        // 재료가 다 갖춰졌는지. 한쪽이라도 모자라면 시작하지 않는다.
        if (this.inputA.storedCount < this.costA) return;
        if (this.costB > 0) {
            if (!this.inputB || this.inputB.storedCount < this.costB) return;
        }
        this._intaking = true;
        this._tookA = 0;
        this._tookB = 0;
        this._intakeTimer = 0;
    }

    /** 재료를 한 개씩 대장간으로 빨아들인다. 스택을 null로 주면 재료가 여기까지 날아온 뒤
     * 그대로 사라진다 — 대장간이 재료를 "먹는" 그림이 된다(일꾼의 흡수와 같은 방식). */
    private _tickIntake(dt: number) {
        this._intakeTimer += dt;
        if (this._intakeTimer < this.intakeInterval) return;
        this._intakeTimer = 0;

        if (this._tookA < this.costA) {
            if (this.inputA!.transferOneTo(this.node, null)) this._tookA++;
            return;
        }
        if (this.costB > 0 && this._tookB < this.costB) {
            if (this.inputB!.transferOneTo(this.node, null)) this._tookB++;
            return;
        }
        // 재료를 다 먹었다 — 이제 굽는다.
        this._intaking = false;
        this._crafting = true;
        this._craftTimer = 0;
    }

    private _tickCraft(dt: number) {
        this._craftTimer += dt;
        if (this._craftTimer < this.craftDuration) return;
        this._craftTimer = 0;
        this._crafting = false;

        const w = this.node.worldPosition;
        const pos = new Vec3(w.x, w.y + this.outputHeight, w.z);
        const type: ResourceType = this.output!.acceptedType;
        for (let i = 0; i < this.yieldCount; i++) {
            this.coinPool!.spawn(pos, this.output!.node, 999, this.output!, false, false, type);
        }
    }
}
