interface TemplateParams {
  trxCd: string;           // RSMPM0000A00
  beanNm: string;          // MMPM0000A00
  beanDir: string;         // 예: "common" or "specific"
  logicNm: string;
  author: string;
  eaiNm: string;
  today: string;           // YYYY-MM-DD
}

/**
 * 오늘 날짜 반환 (YYYY-MM-DD)
 */
const getToday = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Service 코드 생성 (분리 모드)
 */
export const generateSeparatedServiceCode = (params: TemplateParams): string => {
  const { trxCd, beanNm, beanDir, logicNm, author, eaiNm, today } = params;
  const trxCdLower = trxCd.toLowerCase();
  const beanNmLower = beanNm.toLowerCase();

  return `package dbs.mcd.mpm.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import dbs.mcd.mcm.bean.common.MMCMCommA01;
import dbs.mcd.mcm.utils.McmConstUtil;
import dbs.mcd.mpm.bean.${beanDir}.${beanNm};
import dbs.mcd.mpm.inf.eai.dto.${eaiNm}InDto;
import dbs.mcd.mpm.inf.eai.dto.${eaiNm}OutDto;
import shb.context.ShbApplicationContext;
import shb.utils.ShbMessageUtils;

/**
 * ${logicNm}
 * 
 * 변경이력
 * ------- ------- ----------- --------------- --------------------------------
 * 버전    성명    일자        근거자료        변경내용                        
 * ------- ------- ----------- --------------- --------------------------------
 * 0.1     ${author} ${today}  The NEXT 구축 신규 작성
 * ------- ------- ----------- --------------- --------------------------------
 */
@BxmService("${trxCd}")
@BxmCategory(logicalName="${logicNm}", author="${author}")
public class ${trxCd} {
	private Logger logger= LoggerFactory.getLogger(getClass());
	
	/**
	 * 공통 Bean변수 선언
	 */
	private MMCMCommA01 mMCMCommA01;

	/**
	 * Bean 선언
	 */ 
	private ${beanNm} ${beanNmLower};
	
	@BxmServiceOperation("${trxCd}")
	@BxmCategory(logicalName="${logicNm}", author="${author}")
	public ${eaiNm}OutDto ${trxCdLower}(${eaiNm}InDto input) {
		logger.debug("============== START ==============");
		logger.debug("input = {}", input);

		/**
		 * 출력변수 초기화
		 */
		${eaiNm}OutDto output = new ${eaiNm}OutDto();

		/**
		 * 초기화
		 */
		{
			initParam(input);
		}
  
		/**
		 * 선처리
		 */
		{
			beforeProcess(input);
		}

		/**
		 * 업무처리
		 */
		{
			output = bizProcess(input, output);
		}
  
		/**
		 * 후처리
		 */
		{
			output = afterProcess(input, output);
		}
  
		logger.debug("output = {}", output);
		logger.debug("============== END ==============");
		
		return output;
	}
	
	@BxmCategory(logicalName="초기화", description="초기화", author="${author}")
	private void initParam(${eaiNm}InDto input) {
		/**
		 * Bean 초기화
		 */
		mMCMCommA01 = ShbApplicationContext.getBean(mMCMCommA01, MMCMCommA01.class);
		${beanNmLower} = ShbApplicationContext.getBean(${beanNmLower}, ${beanNm}.class);
	}
	
	@BxmCategory(logicalName="선처리", description="선처리", author="${author}")
	private void beforeProcess(${eaiNm}InDto input) {
		/**
		 * 공통 서비스 선처리를 호출
		 */
		this.mMCMCommA01.preApCommon(input, McmConstUtil.PROC_RIB_COM);
	}

	@BxmCategory(logicalName="업무처리", description="업무처리", author="${author}")
	private ${eaiNm}OutDto bizProcess(${eaiNm}InDto input , ${eaiNm}OutDto output) {
		/**
		 * Bean 호출
		 */  
		output = ${beanNmLower}.processService(input);
  
		return output;
	}

	@BxmCategory(logicalName="후처리", description="후처리", author="${author}")
	private ${eaiNm}OutDto afterProcess(${eaiNm}InDto input , ${eaiNm}OutDto output) {
		/**
		 * 공통 서비스 후처리
		 */
		this.mMCMCommA01.postApCommon(output, input, McmConstUtil.PROC_RIB_COM);
		
		// 상세메시지 : MCM0000N - {0} 처리가 정상처리 되었습니다.
		ShbApplicationContext.addMessage(ShbMessageUtils.getMessage("MCM0000N"), new Object[]{"${logicNm}"} );
  
		return output;
	}
}`;
};

/**
 * Bean 코드 생성 (분리 모드)
 */
export const generateSeparatedBeanCode = (params: TemplateParams): string => {
  const { trxCd, beanNm, beanDir, logicNm, author, eaiNm, today } = params;

  return `package dbs.mcd.mpm.bean.${beanDir};

import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;
import dbs.mcd.mcm.bean.common.MMCMBizValidationN00;
import dbs.mcd.mcm.bean.common.MMCMBizValidationN01;
import dbs.mcd.mpm.inf.eai.dto.${eaiNm}InDto;
import dbs.mcd.mpm.inf.eai.dto.${eaiNm}OutDto;
import shb.context.ShbApplicationContext;
import shb.inf.InterfaceResult;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * ${logicNm}
 * 
 * 변경이력
 * ------- ------- ----------- --------------- --------------------------------
 * 버전    성명    일자        근거자료        변경내용                        
 * ------- ------- ----------- --------------- --------------------------------
 * 0.1     ${author} ${today}  The NEXT 구축 신규 작성
 * ------- ------- ----------- --------------- --------------------------------
 */
@BxmBean
@BxmCategory(logicalName="${logicNm}", author="${author}")
public class ${beanNm} {
	private Logger logger= LoggerFactory.getLogger(getClass());
	
	/**
	 * 공통 Bean 선언 - validation check
	 */
	private MMCMBizValidationN01 mMCMBizValidationN01;
	private MMCMBizValidationN00 mMCMBizValidationN00;
	
	@BxmCategory(logicalName="${logicNm}", author="${author}")
	public ${eaiNm}OutDto processService(${eaiNm}InDto input) {
		logger.info("============== Bean START ==============");
		logger.info("input = {}", input);
		
		/**
		 * 출력변수 초기화
		 */
		${eaiNm}OutDto output = new ${eaiNm}OutDto();
		
		/**
		 * 초기화
		 */
		beanInitparam(input);

		/**
		 * 선처리
		 */
		input = beanBefore(input);

		/**
		 * 업무처리
		 */
		output = beanBiz(input, output);

		/**
		 * 후처리
		 */
		output = beanAfter(input, output);
		
		logger.info("output = {}", output);
		logger.info("============== Bean END ==============");
		return output;
	}
	
	@BxmCategory(logicalName="초기화", description="초기화", author="${author}")
	private void beanInitparam(${eaiNm}InDto input) {
		/**
		 * 공통 bean 가져오기
		 */
		mMCMBizValidationN01 = ShbApplicationContext.getBean(mMCMBizValidationN01, MMCMBizValidationN01.class);
		mMCMBizValidationN00 = ShbApplicationContext.getBean(mMCMBizValidationN00, MMCMBizValidationN00.class);
	}
	
	@BxmCategory(logicalName="선처리", description="선처리", author="${author}")
	private ${eaiNm}InDto beanBefore(${eaiNm}InDto input) {
		/**
		 * 입력 전문 validation check 
		 */
		mMCMBizValidationN01.processService(input, "${trxCd}");
		mMCMBizValidationN00.checkBiz();
		input = (${eaiNm}InDto)mMCMBizValidationN00.checkBizParam(input);
		
		return input;
	}
	
	@BxmCategory(logicalName="업무처리", description="업무처리", author="${author}")
	private ${eaiNm}OutDto beanBiz(${eaiNm}InDto input, ${eaiNm}OutDto output) {
		/**
		 * EAI를 통해 BXM4 서비스 호출
		 */
		InterfaceResult<${eaiNm}OutDto> result = null;
		result = mMCMBizValidationN00.callInterface(result, input, output, ${eaiNm}OutDto.class);
		output = result.getRecvData();
		
		return output;
	}
	
	@BxmCategory(logicalName="후처리", description="후처리", author="${author}")
	private ${eaiNm}OutDto beanAfter(${eaiNm}InDto input, ${eaiNm}OutDto output) {
		return output;
	}
}`;
};

/**
 * Service + Bean 통합 코드 생성
 */
export const generateIntegratedServiceCode = (params: TemplateParams): string => {
  const { trxCd, logicNm, author, eaiNm, today } = params;
  const trxCdLower = trxCd.toLowerCase();

  return `package dbs.mcd.mpm.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import dbs.mcd.mcm.bean.common.MMCMCommA01;
import dbs.mcd.mcm.bean.common.MMCMBizValidationN00;
import dbs.mcd.mcm.bean.common.MMCMBizValidationN01;
import dbs.mcd.mcm.utils.McmConstUtil;
import dbs.mcd.mpm.inf.eai.dto.${eaiNm}InDto;
import dbs.mcd.mpm.inf.eai.dto.${eaiNm}OutDto;
import shb.context.ShbApplicationContext;
import shb.inf.InterfaceResult;
import shb.utils.ShbMessageUtils;

/**
 * ${logicNm}
 * 
 * 변경이력
 * ------- ------- ----------- --------------- --------------------------------
 * 버전    성명    일자        근거자료        변경내용                        
 * ------- ------- ----------- --------------- --------------------------------
 * 0.1     ${author} ${today}  The NEXT 구축 신규 작성
 * ------- ------- ----------- --------------- --------------------------------
 */
@BxmService("${trxCd}")
@BxmCategory(logicalName="${logicNm}", author="${author}")
public class ${trxCd} {
	private Logger logger= LoggerFactory.getLogger(getClass());
	
	/**
	 * 공통 Bean변수 선언
	 */
	private MMCMCommA01 mMCMCommA01;
	private MMCMBizValidationN01 mMCMBizValidationN01;
	private MMCMBizValidationN00 mMCMBizValidationN00;
	

	@BxmServiceOperation("${trxCd}")
	@BxmCategory(logicalName="${logicNm}", author="${author}")
	public ${eaiNm}OutDto ${trxCdLower}(${eaiNm}InDto input) {
		logger.debug("============== START ==============");
		logger.debug("input = {}", input);

		/**
		 * 출력변수 초기화
		 */
		${eaiNm}OutDto output = new ${eaiNm}OutDto();

		/**
		 * 초기화
		 */
		{
			initParam(input);
		}
  
		/**
		 * 선처리
		 */
		{
			input = beforeProcess(input);
		}

		/**
		 * 업무처리
		 */
		{
			output = bizProcess(input, output);
		}
  
		/**
		 * 후처리
		 */
		{
			output = afterProcess(input, output);
		}
  
		logger.debug("output = {}", output);
		logger.debug("============== END ==============");
		
		return output;
	}
	
	@BxmCategory(logicalName="초기화", description="초기화", author="${author}")
	private void initParam(${eaiNm}InDto input) {
		/**
		 * 공통 Bean 초기화
		 */
		mMCMCommA01 = ShbApplicationContext.getBean(mMCMCommA01, MMCMCommA01.class);
		mMCMBizValidationN01 = ShbApplicationContext.getBean(mMCMBizValidationN01, MMCMBizValidationN01.class);
		mMCMBizValidationN00 = ShbApplicationContext.getBean(mMCMBizValidationN00, MMCMBizValidationN00.class);
	}
	
	@BxmCategory(logicalName="선처리", description="선처리", author="${author}")
	private ${eaiNm}InDto beforeProcess(${eaiNm}InDto input) {
		/**
		 * @BXMType BeanCall
		 * 공통 서비스 선처리를 호출
		 */
		this.mMCMCommA01.preApCommon(input, McmConstUtil.PROC_RIB_COM);
		
		/**
		 * 입력 전문 validation check 
		 */
		mMCMBizValidationN01.processService(input, "${trxCd}");
		mMCMBizValidationN00.checkBiz();
		input = (${eaiNm}InDto)mMCMBizValidationN00.checkBizParam(input);
		
		return input;
	}

	@BxmCategory(logicalName="업무처리", description="업무처리", author="${author}")
	private ${eaiNm}OutDto bizProcess(${eaiNm}InDto input , ${eaiNm}OutDto output) {
		/**
		 * EAI를 통해 BXM4 서비스 호출
		 */
		InterfaceResult<${eaiNm}OutDto> result = null;
		result = mMCMBizValidationN00.callInterface(result, input, output, ${eaiNm}OutDto.class);
		output = result.getRecvData();
  
		return output;
	}

	@BxmCategory(logicalName="후처리", description="후처리", author="${author}")
	private ${eaiNm}OutDto afterProcess(${eaiNm}InDto input , ${eaiNm}OutDto output) {
		/**
		 * 공통 서비스 후처리
		 */
		this.mMCMCommA01.postApCommon(output, input, McmConstUtil.PROC_RIB_COM);
		
		// 상세메시지 : MCM0000N - {0} 처리가 정상처리 되었습니다.
		ShbApplicationContext.addMessage(ShbMessageUtils.getMessage("MCM0000N"), new Object[]{"${logicNm}"} );
  
		return output;
	}
}`;
};

/**
 * 템플릿 파라미터 생성 헬퍼
 */
export const createTemplateParams = (
  trxCd: string,
  logicNm: string,
  author: string,
  eaiNm: string
): TemplateParams => {
  // RSMPM0000A00 -> MMPM0000A00
  const beanNm = 'M' + trxCd.slice(2);

  // MMPM0000A00 -> mmpm0000
  const beanDir = beanNm.toLowerCase().slice(-3);
  
  return {
    trxCd,
    beanNm,
    beanDir,
    logicNm,
    author,
    eaiNm: eaiNm || trxCd, // EAI 없으면 trxCd 사용
    today: getToday()
  };
};