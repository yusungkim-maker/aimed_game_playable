import { _decorator, Component, Node, Quat, Vec3, Color, CCInteger, CCFloat, Material,
         MeshRenderer, SkinnedMeshRenderer, tween } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
import { ResourceType } from './ResourceType';
const { ccclass, property } = _decorator;

/** 넘어짐 계산용 임시값 — 개체 수만큼 도는 경로라 매번 새로 만들지 않는다. */
const _fallAxis = new Vec3();
const _fallSpin = new Quat();

/**
 * 플레이어가 때려서 자원을 뱉는 채집 오브젝트(나무 등) 1개.
 *
 * **자원 자체는 코인과 완전히 같은 물건이다** — 스폰·자석·등 뒤 스택·소켓 흡수 경로를
 * 그대로 탄다. 다른 것은 "무엇이 뱉느냐"뿐이라서, 이 컴포넌트는 타격 횟수를 세고
 * `CoinEvents.ResourceDropped`를 쏘는 일만 한다(몬스터가 죽을 때 `MonsterKilled`를 쏘는 것과
 * 같은 자리). 통나무로 보이게 하는 것은 씬의 `CoinPool.coinPrefab` /
 * `CoinStack.stackCoinPrefab`을 바꾸는 **인스펙터 값**이지 코드가 아니다.
 *
 * 자기등록(self-registration) 방식이다 — 매니저가 목록을 들고 있지 않고 각 객체가
 * `onEnable`에서 `Choppable.all`에 자기를 넣는다(`VirtualWall.all`/`DoorHealth.all`과 동일).
 * 그래서 **나무가 한 그루도 없는 씬에서는 목록이 비어 있어 `Player`의 탐색이 즉시 null을
 * 돌려준다** — 기존 씬은 이 컴포넌트가 있는지조차 모른 채 그대로 동작한다.
 */
@ccclass('Choppable')
export class Choppable extends Component {
    /** 현재 씬에 살아있는 채집 오브젝트 전부. Player가 가장 가까운 것을 찾을 때만 훑는다. */
    static readonly all: Choppable[] = [];

    @property({ type: ResourceType, displayName: '뱉는 자원', tooltip: '이 채집물을 때리면 무엇이 떨어지는가. 나무면 통나무, 철이면 광석이다 — **광산도 이 값만 철로 바꾼 채집물이라 별도 클래스가 없다.** 기본값이 코인이라 자원 구분이 없던 씬은 예전과 똑같이 동작한다' })
    dropResourceType: ResourceType = ResourceType.Coin;

    @property({ type: CCInteger, displayName: '파괴까지 타격 횟수', tooltip: '이 횟수만큼 맞으면 사라진다. 아래 "타격별 드롭 개수" 배열보다 크면, 배열의 마지막 값이 계속 쓰인다' })
    hitsToDestroy: number = 3;

    @property({ type: [CCInteger], displayName: '타격별 드롭 개수', tooltip: '1번째 타격에 몇 개, 2번째에 몇 개... 순서대로. 기본 3/4/5 = 때릴수록 더 많이 뱉어서 마지막 한 방이 시원하게 터진다. 배열이 타격 횟수보다 짧으면 마지막 값을 반복한다' })
    dropsPerHit: number[] = [3, 4, 5];

    @property({ type: CCFloat, displayName: '자원이 튀어나오는 높이(m)', tooltip: '자원이 이 오브젝트의 밑동이 아니라 이만큼 위에서 튀어나온다. 나무는 줄기 중간쯤(1~1.5)이 자연스럽다' })
    dropHeight: number = 1.2;

    @property({ type: CCFloat, displayName: '타격 흔들림 각도(도)', tooltip: '맞을 때마다 좌우로 이만큼 기울었다 돌아온다 — 0이면 흔들리지 않는다. 타격이 먹혔다는 유일한 피드백이므로 0으로 두려면 대신 이펙트나 사운드를 붙일 것' })
    hitShakeAngle: number = 8;

    @property({ type: CCFloat, displayName: '타격 흔들림 시간(초)', tooltip: '기울었다가 원래 각도로 돌아오는 데 걸리는 시간. 타격 간격보다 짧아야 다음 타격과 겹치지 않는다' })
    hitShakeDuration: number = 0.12;

    // ── 피격 번쩍임 ─────────────────────────────────────────────────────────
    // 몬스터(Monster.ts의 _flashWhite)와 완전히 같은 방식이다 — 렌더러의 머티리얼 인스턴스에
    // emissive를 넣었다가 되돌린다. 몬스터는 흰색이지만 나무는 붉은색이 기본이다.
    @property({ type: Color, displayName: '피격 번쩍임 색', tooltip: '맞는 순간 이 색으로 발광한다. 알파는 쓰이지 않는다. 0,0,0(검정)으로 두면 번쩍임이 사실상 꺼진다 — 셰이더의 기본 emissive가 검정이기 때문' })
    hitFlashColor: Color = new Color(255, 60, 40, 255);

    @property({ type: CCFloat, displayName: '피격 번쩍임 세기', tooltip: '발광 배율(emissiveScale). 클수록 밝게 타오른다. 1이면 색이 거의 안 보이므로 3~5 사이가 무난하다' })
    hitFlashIntensity: number = 4;

    @property({ type: CCFloat, displayName: '피격 번쩍임 시간(초)', tooltip: '번쩍였다가 원래 색으로 돌아오는 데 걸리는 시간. 타격 간격보다 짧아야 다음 타격이 새로 번쩍이는 것으로 읽힌다. 0 이하면 번쩍이지 않는다' })
    hitFlashDuration: number = 0.12;

    @property({ type: CCInteger, displayName: '번쩍일 머티리얼 슬롯', tooltip: '피격 시 물들일 머티리얼 슬롯 번호. **-1이면 전부**(기본값 — 서브메시가 하나뿐인 보통 메시는 어차피 결과가 같다). 2D 카드는 한 메시에 판이 두 장 들어 있고 **슬롯 0 = 바닥 그림자 / 슬롯 1 = 세워진 오브젝트**다. 그림자까지 하얗게 번쩍이면 땅에서 빛이 나는 것처럼 보이므로 카드에는 1을 넣어 오브젝트 판만 물들인다' })
    flashMaterialSlot: number = -1;

    @property({ type: CCFloat, displayName: '쓰러지는 시간(초)', tooltip: '마지막 타격 후 옆으로 넘어지며 사라지는 데 걸리는 시간. 이 연출이 끝나야 노드가 destroy된다' })
    fallDuration: number = 0.35;

    @property({ type: CCFloat, displayName: '쓰러지는 각도(도)', tooltip: '넘어질 때 최종적으로 기우는 각도. 90이면 완전히 옆으로 눕는다' })
    fallAngle: number = 80;

    @property({ type: Vec3, displayName: '쓰러지는 축 (월드)', tooltip: '넘어질 때 월드 좌표계에서 이 축을 중심으로 회전한다. 기본값 (0,0,1)은 예전 동작 그대로다(월드 Z축 = 화면 좌우로 눕는다). 2D 카드로 만든 나무는 판이 45도로 기울어 서 있어서 월드 Z로 돌리면 판이 원뿔을 그리며 화면에서 사선으로 넘어간다 — 카메라 정면 방향을 넣으면 판이 화면 안에서만 도는 순수한 2D 회전이 되어 왼쪽/오른쪽으로 깔끔하게 눕는다(오소 카메라가 (-45,0,0)이면 (0, -0.7071, -0.7071)). 길이는 자동으로 정규화하므로 방향만 맞으면 된다. (0,0,0)이면 예전 동작으로 돌아간다' })
    fallAxis: Vec3 = new Vec3(0, 0, 1);

    @property({ displayName: '쓰러지며 동시에 줄어들기', tooltip: '켜면(기본) 넘어지는 **동안** 크기가 0으로 줄어 한 동작으로 사라진다. 끄면 예전처럼 다 넘어간 뒤에 줄어든다 — 두 단계로 보여 조금 더 느리게 느껴진다' })
    shrinkWhileFalling: boolean = true;

    @property({ type: CCFloat, displayName: '다시 자라기까지(초)', tooltip: '0이면 한 번 베면 영영 사라진다(노드 destroy). 0보다 크면 그 시간 뒤에 같은 자리에서 다시 자라나 무한히 벨 수 있다 — 일꾼이 계속 베는 자동화 구조에서는 이 값이 0이면 곧 벨 나무가 떨어져 생산이 멈춘다' })
    respawnSeconds: number = 0;

    @property({ type: TriggerId, displayName: '사라짐 트리거 (건물)', tooltip: '이 트리거가 발화하면 이 개체는 **자원을 주지 않고 쓰러져 사라진다.** 그 자리에 건물이나 바닥이 들어설 때 비켜주기 위한 것이다. None(기본)이면 절대 사라지지 않는다. "다시 자라기까지"가 0인 개체(한 번 캐면 끝인 나무)에만 의미가 있다 — 다시 자라는 나무에 걸면 사라진 뒤 다시 올라올 일이 없어 그냥 없어지는 것과 같다. 어느 건물이 어느 나무를 치울지는 이 값 하나로 정해지므로, 같은 자리에 여러 나무가 섞여 있어도 건물마다 딱 자기 몫만 걷힌다' })
    clearTriggerId: TriggerId = TriggerId.None;

    @property({ type: CCFloat, displayName: '사라짐 지연(초)', tooltip: '위 트리거가 온 뒤 이만큼 기다렸다가 쓰러진다. 여럿이 한꺼번에 사라질 때 개체마다 조금씩 다르게 주면 차례로 넘어가 보인다 — ScatterField가 깔아줄 때는 그쪽이 개체마다 무작위 지연을 얹어준다' })
    clearDelay: number = 0;

    @property({ type: CCFloat, displayName: '다시 자라는 시간(초)', tooltip: '리스폰할 때 스케일 0에서 원래 크기까지 커지는 데 걸리는 시간' })
    regrowDuration: number = 0.4;

    private _hits = 0;
    /** 아직 1개가 되지 못한 자원의 소수점 몫. 위력이 1보다 작은 타격자(일꾼)가 때릴 때만 0이 아니다. */
    private _dropAccum = 0;
    private _dying = false;
    /** 프리팹 원래 각도 — 흔들림은 이 각도를 기준으로 더했다 빼야 여러 번 맞아도 누적되지 않는다 */
    private _baseEuler = new Vec3();
    /** 배치된 원래 크기 — 리스폰할 때 여기로 되돌아온다 */
    private _baseScale = new Vec3(1, 1, 1);

    /** 번쩍이게 할 렌더러들. 스폰 시점에 한 번만 모은다 — 나무는 수백 그루가 깔리므로
     * 타격할 때마다 자식을 훑으면 그 비용이 개체 수만큼 곱해진다. */
    private _renderers: (MeshRenderer | SkinnedMeshRenderer)[] = [];
    /** 이번 번쩍임에 건드린 머티리얼 인스턴스 — 되돌릴 때 이것만 손댄다 */
    private _flashMaterials: Material[] = [];
    private _restoreFlashBound = () => this._restoreFlash();

    onLoad() {
        // 트리거를 안 쓰는 개체는 아예 등록하지 않는다 — 숲은 수백 그루라 쓸모없는 리스너가
        // 그만큼 쌓이면 그 자체가 비용이 된다.
        if (this.clearTriggerId !== TriggerId.None) {
            CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
        }
        this._baseEuler = this.node.eulerAngles.clone();
        this._baseScale = this.node.scale.clone();
        this._renderers = [
            ...this.getComponentsInChildren(SkinnedMeshRenderer),
            ...this.getComponentsInChildren(MeshRenderer),
        ];
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (triggerId !== this.clearTriggerId) return;
        this.clearAway(this.clearDelay);
    }

    onEnable() {
        if (!Choppable.all.includes(this)) Choppable.all.push(this);
    }

    onDisable() {
        const i = Choppable.all.indexOf(this);
        if (i >= 0) Choppable.all.splice(i, 1);
    }

    /** 이미 다 맞아서 쓰러지는 중인지 — Player가 죽은 대상을 계속 때리지 않도록 확인한다 */
    get isDying(): boolean { return this._dying; }

    /**
     * 1회 타격. 이번 타격 몫의 자원을 그 자리에 뱉고, 마지막 타격이면 쓰러진다.
     * **이번 타격으로 뱉은 개수를 돌려준다**(이미 쓰러지는 중이면 0).
     *
     * @param harvester 이 나무를 벤 쪽(플레이어 또는 일꾼)의 노드. 자원이 **누구의 등으로
     *   갈지**를 결정한다 — `CoinSpawnController`가 이 노드에 붙은 `CoinStack`을 보고 그쪽으로
     *   날려보낸다. null이면 씬의 기본 대상(플레이어)에게 간다.
     *
     * 자원 스폰 자체는 `CoinSpawnController`가 받아서 처리한다 — 여기서는 풀도 플레이어도
     * 참조하지 않는다(몬스터가 자기를 죽인 쪽을 모르는 것과 같은 이유).
     */
    chop(harvester: Node | null = null, power: number = 1): number {
        if (this._dying) return 0;

        // 위력이 1보다 작으면 그만큼 여러 번 때려야 쓰러진다. 그래도 **한 그루에서 나오는 총
        // 개수는 같아야** 하므로, 이번 타격 몫도 같은 비율로 줄여 소수점을 누적해 둔다 —
        // 예: 위력 0.5면 매 타격 0.5개씩 쌓여 두 번에 한 번꼴로 1개가 나온다. 위력 1이면
        // 누적값이 항상 정수라 예전과 완전히 같다(기존 씬 무영향).
        const p2 = power > 0 ? power : 1;
        const idx = Math.min(Math.floor(this._hits), this.dropsPerHit.length - 1);
        const per = this.dropsPerHit.length > 0 ? this.dropsPerHit[idx] : 0;
        this._dropAccum += per * p2;
        const count = Math.floor(this._dropAccum + 1e-6);
        this._dropAccum -= count;
        this._hits += p2;

        if (count > 0) {
            const p = this.node.worldPosition;
            CoinEvents.emit(
                CoinEventName.ResourceDropped,
                new Vec3(p.x, p.y + this.dropHeight, p.z),
                count,
                harvester,
                this.dropResourceType,
            );
        }

        this._flashHit();

        if (this._hits >= this.hitsToDestroy) this._fallAndDestroy();
        else this._playHitShake();

        return count;
    }

    /**
     * 맞는 순간 발광시켰다가 되돌린다.
     *
     * 몬스터와 같은 이유로 **머티리얼 에셋이 아니라 인스턴스**를 건드린다 — 에셋을 고치면
     * 같은 머티리얼을 쓰는 나무 전부가 함께 번쩍인다(나무는 T_Tree.mtl 한 장을 공유한다).
     * `getMaterialInstance`는 렌더러별 사본을 지연 생성하므로 이 그루만 물든다.
     */
    private _flashHit() {
        if (this.hitFlashDuration <= 0) return;

        this._flashMaterials = [];
        for (const r of this._renderers) {
            if (!r || !r.isValid) continue;
            // **모든 머티리얼 슬롯**을 물들인다. 서브메시가 하나뿐인 3D 나무에서는 예전과
            // 완전히 같지만, 2D 카드처럼 한 메시에 판이 두 장 들어 있으면 슬롯마다
            // 머티리얼이 따로라서 0번만 물들이면 **바닥 그림자 판만 번쩍이고 정작
            // 나무 그림은 그대로 남는다.**
            const slots = r.sharedMaterials.length;
            for (let i = 0; i < slots; i++) {
                if (this.flashMaterialSlot >= 0 && i !== this.flashMaterialSlot) continue;
                const inst = r.getMaterialInstance(i);
                if (!inst) continue;
                this._flashMaterials.push(inst);
                inst.setProperty('emissive', this.hitFlashColor);
                inst.setProperty('emissiveScale',
                    new Vec3(this.hitFlashIntensity, this.hitFlashIntensity, this.hitFlashIntensity));
            }
        }
        // 연속 타격으로 복원 예약이 겹치면 먼저 걸린 것이 늦게 터져 번쩍임이 일찍 꺼진다.
        this.unschedule(this._restoreFlashBound);
        this.scheduleOnce(this._restoreFlashBound, this.hitFlashDuration);
    }

    /** 셰이더가 정의한 기본값(emissive=검정, scale=1)으로 직접 되돌린다 — 몬스터와 동일한 처리.
     * 원래 값을 기억했다 넣는 방식은 인스턴스 생성 시점에 값이 비어 있어 복원이 누락된다. */
    private _restoreFlash() {
        for (const mat of this._flashMaterials) {
            if (!mat || !mat.isValid) continue;
            mat.setProperty('emissive', new Color(0, 0, 0, 255));
            mat.setProperty('emissiveScale', new Vec3(1, 1, 1));
        }
        this._flashMaterials = [];
    }

    /** 맞을 때마다 기울었다 원위치. 연속 타격에 각도가 누적되지 않도록 항상 _baseEuler 기준. */
    private _playHitShake() {
        if (this.hitShakeAngle === 0 || this.hitShakeDuration <= 0) return;
        const b = this._baseEuler;
        const dir = Math.random() < 0.5 ? -1 : 1;
        tween(this.node)
            .to(this.hitShakeDuration * 0.35, { eulerAngles: new Vec3(b.x, b.y, b.z + this.hitShakeAngle * dir) })
            .to(this.hitShakeDuration * 0.65, { eulerAngles: b.clone() })
            .start();
    }

    /**
     * 옆으로 넘어지며 사라진다.
     *
     * `_dying`을 **tween을 시작하기 전에** 세운다 — 쓰러지는 동안에도 Player의 탐색 대상에서
     * 빠져야 마지막 한 방 뒤에 허공을 계속 때리지 않는다. 목록에서도 즉시 뺀다(노드 destroy는
     * 연출이 끝난 뒤라 onDisable이 그때까지 안 불린다).
     */
    private _fallAndDestroy() {
        this._dying = true;
        const i = Choppable.all.indexOf(this);
        if (i >= 0) Choppable.all.splice(i, 1);

        this._playFall(0, () => { if (this.respawnSeconds > 0) this._scheduleRegrow(); else this.node.destroy(); });
    }

    /**
     * 자원을 뱉지 않고 쓰러짐 연출과 함께 없앤다 — **건물이 들어서면서 그 자리의 채집물이
     * 치워지는** 경우에 쓴다(`ScatterField`의 "사라짐 트리거"가 이걸 부른다).
     *
     * `chop()`과 다른 점 둘: ① 타격 수를 세지 않고 자원도 떨어뜨리지 않는다 — 플레이어가
     * 벤 것이 아니므로 보상이 없어야 한다. ② `다시 자라기까지`가 설정돼 있어도 **다시 자라지
     * 않는다** — 자리를 비우는 것이 목적이라 되돌아오면 안 된다.
     *
     * @param delay 이 시간만큼 뒤에 쓰러지기 시작한다. 한 번에 수십 그루를 치울 때 개체마다
     *   다른 값을 주면 동시에 펑 사라지지 않고 차례로 넘어진다.
     */
    clearAway(delay: number = 0) {
        if (this._dying) return;
        // 지연을 기다리는 동안에도 탐색 대상에서 빠져야 한다 — 어차피 사라질 나무를
        // 플레이어가 때리기 시작하면 자원을 주고도 쓰러지는 모순이 생긴다.
        this._dying = true;
        const i = Choppable.all.indexOf(this);
        if (i >= 0) Choppable.all.splice(i, 1);

        this._playFall(delay, () => { if (this.node.isValid) this.node.destroy(); });
    }

    /**
     * 넘어지는 연출 한 벌. 베어서 쓰러질 때와 건물에 밀려 치워질 때가 **완전히 같은 동작**이어야
     * 해서 한 곳에 모았다(예전에는 같은 tween이 두 군데에 복사돼 있었다).
     *
     * 회전을 오일러가 아니라 **쿼터니언 앞곱셈**으로 하는 이유: 오일러에 각도를 더하면 그 회전이
     * 노드의 로컬 축에서 일어나므로, 개체마다 다른 방향(yaw)을 갖고 있으면 눕는 방향이 제각각이
     * 된다. `q * base`로 앞에서 곱하면 **월드 축**을 중심으로 돌아 화면에서 항상 같은 방향으로 눕는다.
     */
    private _playFall(delay: number, onDone: () => void) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        const base = this.node.rotation.clone();
        const end = base.clone();

        const ax = this.fallAxis;
        if (ax.lengthSqr() > 1e-6) {
            _fallAxis.set(ax.x, ax.y, ax.z).normalize();
            Quat.fromAxisAngle(_fallSpin, _fallAxis, this.fallAngle * dir * Math.PI / 180);
            Quat.multiply(end, _fallSpin, base);
        }

        const t = tween(this.node).delay(delay);
        if (this.shrinkWhileFalling) {
            // 눕는 동안 같이 줄어든다 — 두 tween을 병렬로 돌린다.
            t.parallel(
                tween<Node>().to(this.fallDuration, { rotation: end }),
                tween<Node>().to(this.fallDuration, { scale: new Vec3(0, 0, 0) }),
            );
        } else {
            t.to(this.fallDuration, { rotation: end })
             .to(this.fallDuration * 0.4, { scale: new Vec3(0, 0, 0) });
        }
        t.call(onDone).start();
    }

    /** 쓰러진 뒤 제자리에서 다시 자란다. 노드를 지우지 않고 상태만 초기화하므로 씬에 배치한
     * 위치·회전·크기가 그대로 유지되고, 다 자란 뒤 목록에 다시 등록되어 또 벨 수 있게 된다.
     * 자라는 동안에는 목록에 없으므로 아무도 이 나무를 목표로 잡지 않는다. */
    private _scheduleRegrow() {
        this.node.setRotationFromEuler(this._baseEuler.x, this._baseEuler.y, this._baseEuler.z);
        this.node.setScale(0, 0, 0);
        this.scheduleOnce(() => {
            this._hits = 0;
            this._dropAccum = 0;
            tween(this.node)
                .to(this.regrowDuration, { scale: this._baseScale.clone() })
                // 다 자란 "뒤"에 목록으로 돌아온다 — 자라는 중에 목표로 잡히면 일꾼이
                // 바닥에서 솟는 나무를 때리는 그림이 된다.
                .call(() => {
                    this._dying = false;
                    if (this.enabledInHierarchy && !Choppable.all.includes(this)) Choppable.all.push(this);
                })
                .start();
        }, this.respawnSeconds);
    }

    /**
     * pos에서 range 안에 있는 가장 가까운 채집 오브젝트의 노드. 없으면 null.
     * **목록이 비어 있으면 루프가 한 번도 돌지 않는다** — 나무가 없는 씬에서 이 함수를 불러도
     * 비용이 사실상 0이고 항상 null이 나온다.
     */
    static findNearestNode(pos: Readonly<Vec3>, range: number): Node | null {
        let best: Node | null = null;
        let minDist = range;
        for (const c of Choppable.all) {
            if (c._dying || !c.node.isValid) continue;
            const d = Vec3.distance(c.node.worldPosition, pos);
            if (d < minDist) { minDist = d; best = c.node; }
        }
        return best;
    }
}
