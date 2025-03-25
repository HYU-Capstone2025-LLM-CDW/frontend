import Layout from "@/components/layout/Layout";
import Link from "next/link";

export default function HomePage() {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-start min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl w-full space-y-8 text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                        <span className="inline-block">Clinical Datawarehouse에</span>{' '}
                        <span className="inline-block">오신 것을 환영합니다</span>
                    </h1>
                    <p className="mt-4 text-lg sm:text-xl text-gray-600 mb-8">
                        환자 데이터 분석 및 코호트 관리를 위한 통합 플랫폼입니다.
                    </p>
                    <div className="mt-8 space-y-4">
                        <Link href="/analysis" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                            데이터 분석 시작하기
                        </Link>
                    </div>
                    <div className="mt-12">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">주요 기능</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium text-gray-900">데이터 분석</h3>
                                    <p className="mt-1 text-sm text-gray-600">환자 데이터를 다양한 관점에서 분석합니다.</p>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium text-gray-900">코호트 관리</h3>
                                    <p className="mt-1 text-sm text-gray-600">환자 그룹을 효과적으로 관리합니다.</p>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium text-gray-900">리포트 생성</h3>
                                    <p className="mt-1 text-sm text-gray-600">분석 결과를 쉽게 리포트로 만듭니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}